import { describe, expect, it } from 'vitest';
import {
  ForgeError,
  bitbucketForgeProvider,
  createForgeProvider,
  defaultForgeTarget,
  forgeTargets,
  githubApiBase,
  githubForgeProvider,
  parseForgeRemote,
  pickForgeRemote,
  type HttpRequest,
  type HttpResponse,
} from '@angkorgit/core';

function fakeHttp(handler: (request: HttpRequest) => HttpResponse) {
  const calls: HttpRequest[] = [];
  const http = async (request: HttpRequest): Promise<HttpResponse> => {
    calls.push(request);
    return handler(request);
  };
  return { http, calls };
}

const githubRemote = () => {
  const remote = parseForgeRemote('git@github.com:cheat2001/angkorgit.git');
  if (!remote) throw new Error('expected a parsed remote');
  return remote;
};

const samplePull = (overrides: Record<string, unknown> = {}) => ({
  number: 12,
  title: 'Add worktrees',
  html_url: 'https://github.com/cheat2001/angkorgit/pull/12',
  state: 'open',
  draft: false,
  merged_at: null,
  created_at: '2026-08-20T10:00:00Z',
  updated_at: '2026-08-21T11:30:00Z',
  user: { login: 'dara', avatar_url: 'https://avatars.example/dara' },
  head: { ref: 'feature/worktrees', sha: 'abc123', repo: { full_name: 'cheat2001/angkorgit' } },
  base: { ref: 'main' },
  ...overrides,
});

describe('parseForgeRemote', () => {
  it('parses github https, scp and ssh remotes', () => {
    for (const url of [
      'https://github.com/cheat2001/angkorgit.git',
      'git@github.com:cheat2001/angkorgit.git',
      'ssh://git@github.com/cheat2001/angkorgit',
    ]) {
      const remote = parseForgeRemote(url);
      expect(remote?.kind).toBe('github');
      expect(remote?.host).toBe('github.com');
      expect(remote?.owner).toBe('cheat2001');
      expect(remote?.repo).toBe('angkorgit');
    }
  });

  it('rejects github paths that are not owner/repo', () => {
    expect(parseForgeRemote('https://github.com/cheat2001')).toBeNull();
    expect(parseForgeRemote('https://github.com/a/b/c')).toBeNull();
  });

  it('treats gitlab hosts as no forge', () => {
    expect(parseForgeRemote('git@gitlab.com:group/project.git')).toBeNull();
    expect(parseForgeRemote('https://gitlab.example.com/group/subgroup/project.git')).toBeNull();
  });

  it('parses bitbucket cloud and server shapes', () => {
    const cloud = parseForgeRemote('git@bitbucket.org:team/repo.git');
    expect(cloud?.kind).toBe('bitbucket');
    expect(cloud?.owner).toBe('team');
    const server = parseForgeRemote('https://bitbucket.corp.dev/scm/PROJ/repo.git');
    expect(server?.kind).toBe('bitbucket-server');
    expect(server?.owner).toBe('PROJ');
    expect(server?.repo).toBe('repo');
  });

  it('returns null for unknown forges and non-remote strings', () => {
    expect(parseForgeRemote('git@git.sr.ht:~user/repo')).toBeNull();
    expect(parseForgeRemote('not a url')).toBeNull();
  });
});

describe('createForgeProvider', () => {
  it('creates providers for github and bitbucket cloud', () => {
    const { http } = fakeHttp(() => ({ status: 200, body: '[]' }));
    expect(createForgeProvider(githubRemote(), http)?.kind).toBe('github');
    const cloud = parseForgeRemote('git@bitbucket.org:team/repo.git');
    expect(cloud && createForgeProvider(cloud, http)?.kind).toBe('bitbucket');
  });

  it('has no api provider for bitbucket server', () => {
    const { http } = fakeHttp(() => ({ status: 200, body: '[]' }));
    const server = parseForgeRemote('https://bitbucket.corp.dev/scm/PROJ/repo.git');
    expect(server && createForgeProvider(server, http)).toBeNull();
  });
});

describe('githubForgeProvider', () => {
  it('uses api.github.com for github.com and /api/v3 for enterprise hosts', () => {
    expect(githubApiBase('github.com')).toBe('https://api.github.com');
    expect(githubApiBase('github.corp.dev:8443')).toBe('https://github.corp.dev:8443/api/v3');
  });

  it('lists open pull requests with mapped fields', async () => {
    const { http, calls } = fakeHttp(() => ({
      status: 200,
      body: JSON.stringify([
        samplePull(),
        samplePull({
          number: 13,
          draft: true,
          head: { ref: 'fix/typo', sha: 'def456', repo: { full_name: 'someone/angkorgit' } },
        }),
        samplePull({ number: 14, head: { ref: 'gone', sha: 'ffff00', repo: null } }),
      ]),
    }));
    const prs = await githubForgeProvider(githubRemote(), http).listOpenPullRequests();
    expect(calls[0].url).toBe(
      'https://api.github.com/repos/cheat2001/angkorgit/pulls?state=open&sort=updated&direction=desc&per_page=50',
    );
    expect(prs).toHaveLength(3);
    expect(prs[0]).toMatchObject({
      number: 12,
      title: 'Add worktrees',
      author: 'dara',
      sourceBranch: 'feature/worktrees',
      targetBranch: 'main',
      state: 'open',
      isDraft: false,
      isFromFork: false,
    });
    expect(prs[0].updatedAt).toBe(Math.floor(Date.parse('2026-08-21T11:30:00Z') / 1000));
    expect(prs[1].isDraft).toBe(true);
    expect(prs[1].isFromFork).toBe(true);
    expect(prs[2].isFromFork).toBe(true);
  });

  it('creates a pull request and returns the mapped result', async () => {
    const { http, calls } = fakeHttp(() => ({
      status: 201,
      body: JSON.stringify(samplePull({ number: 21, title: 'New feature' })),
    }));
    const created = await githubForgeProvider(githubRemote(), http).createPullRequest({
      title: 'New feature',
      body: 'Adds the thing.',
      sourceBranch: 'feature/thing',
      targetBranch: 'main',
      draft: true,
    });
    expect(calls[0].method).toBe('POST');
    expect(calls[0].url).toBe('https://api.github.com/repos/cheat2001/angkorgit/pulls');
    expect(JSON.parse(calls[0].body ?? '{}')).toEqual({
      title: 'New feature',
      head: 'feature/thing',
      base: 'main',
      body: 'Adds the thing.',
      draft: true,
    });
    expect(created.number).toBe(21);
  });

  it('surfaces github error messages with the status', async () => {
    const { http } = fakeHttp(() => ({
      status: 422,
      body: JSON.stringify({
        message: 'Validation Failed',
        errors: [{ message: 'A pull request already exists for feature/thing.' }],
      }),
    }));
    await expect(
      githubForgeProvider(githubRemote(), http).listOpenPullRequests(),
    ).rejects.toMatchObject({
      name: 'ForgeError',
      status: 422,
      message: expect.stringContaining('A pull request already exists'),
    } satisfies Partial<ForgeError> & { message: unknown });
  });

  it('reads the default branch with a fallback', async () => {
    const { http } = fakeHttp((request) => ({
      status: 200,
      body: request.url.endsWith('/repos/cheat2001/angkorgit')
        ? JSON.stringify({ default_branch: 'develop' })
        : '{}',
    }));
    await expect(githubForgeProvider(githubRemote(), http).defaultBranch()).resolves.toBe('develop');
  });

  it('checks out same-repo branches with tracking and fork PRs via refs/pull', async () => {
    const { http } = fakeHttp(() => ({ status: 200, body: '[]' }));
    const provider = githubForgeProvider(githubRemote(), http);
    const base = {
      number: 12,
      title: 't',
      author: 'a',
      authorAvatarUrl: null,
      sourceBranch: 'feature/worktrees',
      targetBranch: 'main',
      url: '',
      state: 'open' as const,
      isDraft: false,
      headSha: '',
      createdAt: 0,
      updatedAt: 0,
    };
    expect(provider.checkoutSpec({ ...base, isFromFork: false })).toEqual({
      sourceRef: 'refs/heads/feature/worktrees',
      localBranch: 'feature/worktrees',
      track: true,
    });
    expect(provider.checkoutSpec({ ...base, isFromFork: true })).toEqual({
      sourceRef: 'refs/pull/12/head',
      localBranch: 'pr/12',
      track: false,
    });
  });
});

describe('bitbucketForgeProvider', () => {
  const bitbucketRemote = () => {
    const remote = parseForgeRemote('git@bitbucket.org:team/repo.git');
    if (!remote) throw new Error('expected a parsed remote');
    return remote;
  };

  const samplePr = (overrides: Record<string, unknown> = {}) => ({
    id: 3,
    title: 'Update docs',
    state: 'OPEN',
    created_on: '2026-08-20T10:00:00Z',
    updated_on: '2026-08-21T11:30:00Z',
    author: { display_name: 'Sokha Chan', nickname: 'sokha', links: { avatar: { href: 'https://bb/a.png' } } },
    source: { branch: { name: 'docs/update' }, commit: { hash: 'ff00aa' }, repository: { full_name: 'team/repo' } },
    destination: { branch: { name: 'main' } },
    links: { html: { href: 'https://bitbucket.org/team/repo/pull-requests/3' } },
    ...overrides,
  });

  it('lists open pull requests from the values envelope', async () => {
    const { http, calls } = fakeHttp(() => ({
      status: 200,
      body: JSON.stringify({ values: [samplePr()] }),
    }));
    const prs = await bitbucketForgeProvider(bitbucketRemote(), http).listOpenPullRequests();
    expect(calls[0].url).toBe(
      'https://api.bitbucket.org/2.0/repositories/team/repo/pullrequests?state=OPEN&sort=-updated_on&pagelen=50',
    );
    expect(prs[0]).toMatchObject({
      number: 3,
      author: 'sokha',
      sourceBranch: 'docs/update',
      targetBranch: 'main',
      state: 'open',
      isFromFork: false,
    });
  });

  it('creates a pull request with source and destination branches', async () => {
    const { http, calls } = fakeHttp(() => ({ status: 201, body: JSON.stringify(samplePr()) }));
    await bitbucketForgeProvider(bitbucketRemote(), http).createPullRequest({
      title: 'Update docs',
      body: 'Details',
      sourceBranch: 'docs/update',
      targetBranch: 'main',
      draft: false,
    });
    expect(JSON.parse(calls[0].body ?? '{}')).toEqual({
      title: 'Update docs',
      description: 'Details',
      source: { branch: { name: 'docs/update' } },
      destination: { branch: { name: 'main' } },
    });
  });

  it('surfaces bitbucket error messages', async () => {
    const { http } = fakeHttp(() => ({
      status: 400,
      body: JSON.stringify({ error: { message: 'source branch not found' } }),
    }));
    await expect(
      bitbucketForgeProvider(bitbucketRemote(), http).listOpenPullRequests(),
    ).rejects.toMatchObject({ status: 400, message: expect.stringContaining('source branch not found') });
  });

  it('tracks same-repo branches and has no checkout for fork pull requests', () => {
    const { http } = fakeHttp(() => ({ status: 200, body: '{}' }));
    const provider = bitbucketForgeProvider(bitbucketRemote(), http);
    const pr = {
      number: 3,
      title: 't',
      author: 'a',
      authorAvatarUrl: null,
      sourceBranch: 'docs/update',
      targetBranch: 'main',
      url: '',
      state: 'open' as const,
      isDraft: false,
      isFromFork: false,
      headSha: '',
      createdAt: 0,
      updatedAt: 0,
    };
    expect(provider.checkoutSpec(pr)).toEqual({
      sourceRef: 'refs/heads/docs/update',
      localBranch: 'docs/update',
      track: true,
    });
    expect(provider.checkoutSpec({ ...pr, isFromFork: true })).toBeNull();
  });
});

describe('pickForgeRemote', () => {
  const remotes = [
    { name: 'github', url: 'git@github.com:me/test.git' },
    { name: 'origin', url: 'git@bitbucket.org:team/test.git' },
  ];

  it('prefers the remote of the current branch upstream', () => {
    expect(pickForgeRemote(remotes, 'github/feature/test1')?.name).toBe('github');
    expect(pickForgeRemote(remotes, 'origin/feature/test1')?.name).toBe('origin');
  });

  it('falls back to origin, then the first remote', () => {
    expect(pickForgeRemote(remotes, null)?.name).toBe('origin');
    expect(pickForgeRemote(remotes, 'gone/branch')?.name).toBe('origin');
    expect(pickForgeRemote([remotes[0]], null)?.name).toBe('github');
    expect(pickForgeRemote([], null)).toBeNull();
  });
});

describe('github validation errors', () => {
  it('spells out field-level errors that carry no message', async () => {
    const { http } = fakeHttp(() => ({
      status: 422,
      body: JSON.stringify({
        message: 'Validation Failed',
        errors: [{ resource: 'PullRequest', field: 'head', code: 'invalid' }],
      }),
    }));
    await expect(
      githubForgeProvider(githubRemote(), http).createPullRequest({
        title: 't',
        body: '',
        sourceBranch: 'feature/x',
        targetBranch: 'main',
        draft: false,
      }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('the source branch does not exist on this remote'),
    });
  });
});

describe('reviewer candidates and requests', () => {
  it('github lists collaborators and requests reviewers after creating', async () => {
    const { http, calls } = fakeHttp((request) => {
      if (request.url.includes('/collaborators')) {
        return {
          status: 200,
          body: JSON.stringify([
            { login: 'dara', name: 'Dara Kim', avatar_url: 'https://a/dara' },
            { login: 'maly' },
          ]),
        };
      }
      if (request.url.endsWith('/requested_reviewers')) {
        return { status: 201, body: JSON.stringify(samplePull()) };
      }
      return { status: 201, body: JSON.stringify(samplePull({ number: 30 })) };
    });
    const provider = githubForgeProvider(githubRemote(), http);
    const users = await provider.listReviewerCandidates();
    expect(users).toEqual([
      { id: 'dara', username: 'dara', name: 'Dara Kim', avatarUrl: 'https://a/dara' },
      { id: 'maly', username: 'maly', name: 'maly', avatarUrl: null },
    ]);
    const pr = await provider.createPullRequest({
      title: 't',
      body: '',
      sourceBranch: 'feature/x',
      targetBranch: 'main',
      draft: false,
      reviewerIds: ['dara'],
    });
    expect(pr.number).toBe(30);
    const reviewerCall = calls.find((c) => c.url.endsWith('/pulls/30/requested_reviewers'));
    expect(reviewerCall?.method).toBe('POST');
    expect(JSON.parse(reviewerCall?.body ?? '{}')).toEqual({ reviewers: ['dara'] });
  });

  it('github still returns the created pr when the reviewer request fails', async () => {
    const { http } = fakeHttp((request) => {
      if (request.url.endsWith('/requested_reviewers')) {
        return { status: 422, body: JSON.stringify({ message: 'Reviews may not be requested' }) };
      }
      return { status: 201, body: JSON.stringify(samplePull({ number: 31 })) };
    });
    const pr = await githubForgeProvider(githubRemote(), http).createPullRequest({
      title: 't',
      body: '',
      sourceBranch: 'feature/x',
      targetBranch: 'main',
      draft: false,
      reviewerIds: ['dara'],
    });
    expect(pr.number).toBe(31);
  });

  it('bitbucket lists workspace members and embeds reviewer uuids on create', async () => {
    const remote = parseForgeRemote('git@bitbucket.org:team/repo.git');
    if (!remote) throw new Error('expected a parsed remote');
    const { http, calls } = fakeHttp((request) => {
      if (request.url.includes('/workspaces/team/members')) {
        return {
          status: 200,
          body: JSON.stringify({
            values: [
              {
                user: {
                  uuid: '{u-1}',
                  nickname: 'sokha',
                  display_name: 'Sokha Chan',
                  links: { avatar: { href: 'https://a/s' } },
                },
              },
            ],
          }),
        };
      }
      return {
        status: 201,
        body: JSON.stringify({ id: 4, title: 't', state: 'OPEN' }),
      };
    });
    const provider = bitbucketForgeProvider(remote, http);
    const users = await provider.listReviewerCandidates();
    expect(users).toEqual([
      { id: '{u-1}', username: 'sokha', name: 'Sokha Chan', avatarUrl: 'https://a/s' },
    ]);
    await provider.createPullRequest({
      title: 't',
      body: '',
      sourceBranch: 'f',
      targetBranch: 'main',
      draft: false,
      reviewerIds: ['{u-1}'],
    });
    const createCall = calls.find((c) => c.method === 'POST');
    expect(JSON.parse(createCall?.body ?? '{}').reviewers).toEqual([{ uuid: '{u-1}' }]);
  });
});

describe('authorAvatar', () => {
  it('github reads the avatar of the commit author', async () => {
    const { http, calls } = fakeHttp((request) =>
      request.url.endsWith('/commits/abc123')
        ? { status: 200, headers: {}, body: JSON.stringify({ author: { avatar_url: 'https://a/dara' } }) }
        : { status: 404, headers: {}, body: '{}' },
    );
    const provider = createForgeProvider(githubRemote(), http)!;
    expect(await provider.authorAvatar({ email: 'dara@example.com', sha: 'abc123' })).toBe('https://a/dara');
    expect(calls[0].url).toBe('https://api.github.com/repos/cheat2001/angkorgit/commits/abc123');
    const { http: unknown } = fakeHttp(() => ({ status: 200, headers: {}, body: JSON.stringify({ author: null }) }));
    expect(await createForgeProvider(githubRemote(), unknown)!.authorAvatar({ email: 'x', sha: 'abc' })).toBeNull();
  });

  it('bitbucket reads the commit author user avatar', async () => {
    const remote = parseForgeRemote('git@bitbucket.org:team/repo.git')!;
    const { http, calls } = fakeHttp(() => ({
      status: 200,
      headers: {},
      body: JSON.stringify({ author: { user: { links: { avatar: { href: 'https://bb/av.png' } } } } }),
    }));
    const provider = createForgeProvider(remote, http)!;
    expect(await provider.authorAvatar({ email: 'x', sha: 'abc' })).toBe('https://bb/av.png');
    expect(calls[0].url).toBe('https://api.bitbucket.org/2.0/repositories/team/repo/commit/abc');
  });
});

describe('pull requests from a fork into upstream', () => {
  const fork = { owner: 'dara', repo: 'angkorgit' };

  it('github sends the fork owner in the head', async () => {
    const { http, calls } = fakeHttp(() => ({ status: 201, body: JSON.stringify(samplePull({ number: 30 })) }));
    const upstream = parseForgeRemote('git@github.com:cheat2001/angkorgit.git');
    if (!upstream) throw new Error('expected a parsed remote');
    const pr = await githubForgeProvider(upstream, http).createPullRequest({
      title: 'From my fork',
      body: '',
      sourceBranch: 'feature/x',
      targetBranch: 'main',
      draft: false,
      sourceRepo: fork,
    });
    expect(calls[0].url).toBe('https://api.github.com/repos/cheat2001/angkorgit/pulls');
    expect(JSON.parse(calls[0].body ?? '{}')).toMatchObject({ head: 'dara:feature/x', base: 'main' });
    expect(pr.number).toBe(30);
  });

  it('bitbucket names the source repository', async () => {
    const { http, calls } = fakeHttp(() => ({ status: 201, body: JSON.stringify({ id: 5, title: 'x', state: 'OPEN' }) }));
    const upstream = parseForgeRemote('git@bitbucket.org:team/repo.git');
    if (!upstream) throw new Error('expected a parsed remote');
    await bitbucketForgeProvider(upstream, http).createPullRequest({
      title: 'x',
      body: '',
      sourceBranch: 'fix/z',
      targetBranch: 'main',
      draft: false,
      sourceRepo: { owner: 'dara', repo: 'repo' },
    });
    expect(calls[0].url).toBe('https://api.bitbucket.org/2.0/repositories/team/repo/pullrequests');
    expect(JSON.parse(calls[0].body ?? '{}')).toMatchObject({
      source: { branch: { name: 'fix/z' }, repository: { full_name: 'dara/repo' } },
      destination: { branch: { name: 'main' } },
    });
  });

  it('lists same-host targets once and prefers upstream over the source remote', () => {
    const source = parseForgeRemote('git@github.com:dara/angkorgit.git');
    if (!source) throw new Error('expected a parsed remote');
    const targets = forgeTargets(
      [
        { name: 'origin', url: 'git@github.com:dara/angkorgit.git' },
        { name: 'upstream', url: 'https://github.com/cheat2001/angkorgit.git' },
        { name: 'mirror', url: 'https://github.com/cheat2001/angkorgit' },
        { name: 'lab', url: 'git@bitbucket.org:dara/angkorgit.git' },
        { name: 'local', url: '/tmp/repo' },
      ],
      source,
    );
    expect(targets.map((t) => t.name)).toEqual(['origin', 'upstream']);
    expect(defaultForgeTarget(targets, 'origin')).toBe('upstream');
    expect(defaultForgeTarget(targets.slice(0, 1), 'origin')).toBe('origin');
    expect(defaultForgeTarget([], 'origin')).toBe('origin');
  });
});

describe('declared forge hosts (issue #32)', () => {
  it('falls back to the connected account kind for a host the substring rules miss', async () => {
    const core = await import('@angkorgit/core');
    core.registerForgeHosts([]);
    expect(core.parseForgeRemote('ssh://git@code.example.com:2222/group/project.git')).toBeNull();
    core.registerForgeHosts([{ host: 'code.example.com', kind: 'github' }]);
    const remote = core.parseForgeRemote('ssh://git@code.example.com:2222/group/project.git');
    expect(remote).toMatchObject({ kind: 'github', owner: 'group', repo: 'project', host: 'code.example.com' });
    expect(core.parseForgeRemote('https://code.example.com/group/sub/project.git')).toBeNull();
    core.registerForgeHosts([{ host: 'git.corp.example', kind: 'github' }]);
    expect(core.parseForgeRemote('git@git.corp.example:acme/tool.git')).toMatchObject({ kind: 'github', owner: 'acme', repo: 'tool' });
    expect(core.parseForgeRemote('ssh://git@code.example.com:2222/group/project.git')).toBeNull();
    core.registerForgeHosts([]);
  });

  it('maps account providers to forge kinds and ignores unknown ones', async () => {
    const { forgeKindForProvider } = await import('@angkorgit/core');
    expect(forgeKindForProvider('github')).toBe('github');
    expect(forgeKindForProvider('gitlab')).toBeNull();
    expect(forgeKindForProvider('gitlab-self')).toBeNull();
    expect(forgeKindForProvider('bitbucket')).toBe('bitbucket');
    expect(forgeKindForProvider('bitbucket-server')).toBe('bitbucket-server');
    expect(forgeKindForProvider('other')).toBeNull();
  });

  it('keeps the built-in hostname rules ahead of declarations', async () => {
    const core = await import('@angkorgit/core');
    core.registerForgeHosts([{ host: 'github.com', kind: 'bitbucket' }]);
    expect(core.parseForgeRemote('git@github.com:acme/tool.git')?.kind).toBe('github');
    core.registerForgeHosts([]);
  });
});

describe('github token refusals on create', () => {
  const refusal = () => ({
    status: 403,
    body: JSON.stringify({ message: 'Resource not accessible by personal access token' }),
  });
  const input = { title: 't', body: '', sourceBranch: 'feature/x', targetBranch: 'main', draft: false };

  it('explains that a fine-grained token cannot open a pull request into another owner\'s repository', async () => {
    const { http } = fakeHttp(refusal);
    await expect(
      githubForgeProvider(githubRemote(), http).createPullRequest({ ...input, sourceRepo: { owner: 'chris', repo: 'angkorgit' } }),
    ).rejects.toMatchObject({
      status: 403,
      message: expect.stringMatching(/fine-grained token can only act on repositories of the account it was created for.*classic token with the repo scope.*GitHub said: Resource not accessible by personal access token\./s),
    });
  });

  it('points at the pull request permission when the same repository refuses', async () => {
    const { http } = fakeHttp(refusal);
    await expect(githubForgeProvider(githubRemote(), http).createPullRequest(input)).rejects.toMatchObject({
      message: expect.stringContaining('"Pull requests: read and write"'),
    });
  });

  it('leaves other 403s such as a rate limit verbatim', async () => {
    const { http } = fakeHttp(() => ({ status: 403, body: JSON.stringify({ message: 'API rate limit exceeded' }) }));
    await expect(githubForgeProvider(githubRemote(), http).createPullRequest(input)).rejects.toMatchObject({
      message: 'GitHub request failed (403): API rate limit exceeded',
    });
  });
});
