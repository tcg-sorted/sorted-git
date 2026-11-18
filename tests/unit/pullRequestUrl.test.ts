import { describe, expect, it } from 'vitest';
import { pullRequestUrl } from '@angkorgit/core';

describe('pullRequestUrl', () => {
  it('builds a GitHub compare URL from an https remote', () => {
    expect(pullRequestUrl('https://github.com/cheat2001/angkorgit.git', 'feature/test1')).toBe(
      'https://github.com/cheat2001/angkorgit/compare/feature%2Ftest1?expand=1',
    );
  });

  it('builds a GitHub compare URL from an scp-style remote', () => {
    expect(pullRequestUrl('git@github.com:cheat2001/angkorgit.git', 'main')).toBe(
      'https://github.com/cheat2001/angkorgit/compare/main?expand=1',
    );
  });

  it('has no link for GitLab hosts', () => {
    expect(pullRequestUrl('https://gitlab.example.com/team/api.git', 'fix/login')).toBeNull();
    expect(pullRequestUrl('git@gitlab.com:team/api.git', 'dev')).toBeNull();
  });

  it('builds a Bitbucket pull request URL', () => {
    expect(pullRequestUrl('git@bitbucket.org:team/repo.git', 'dev')).toBe(
      'https://bitbucket.org/team/repo/pull-requests/new?source=dev',
    );
  });

  it('handles ssh:// remotes with a user', () => {
    expect(pullRequestUrl('ssh://git@github.com/o/r', 'b')).toBe(
      'https://github.com/o/r/compare/b?expand=1',
    );
  });

  it('keeps a non-standard https port in the link', () => {
    expect(pullRequestUrl('https://github.example.com:8443/team/api.git', 'dev')).toBe(
      'https://github.example.com:8443/team/api/compare/dev?expand=1',
    );
  });

  it('preserves plain http for LAN remotes', () => {
    expect(pullRequestUrl('http://github.internal/team/api.git', 'dev')).toBe(
      'http://github.internal/team/api/compare/dev?expand=1',
    );
  });

  it('uses the Bitbucket Server shape for /scm/ clone paths', () => {
    expect(pullRequestUrl('https://bitbucket.company.com/scm/proj/repo.git', 'dev')).toBe(
      'https://bitbucket.company.com/projects/PROJ/repos/repo/pull-requests?create&sourceBranch=refs%2Fheads%2Fdev',
    );
  });

  it('drops the ssh port instead of leaking it into the web link', () => {
    expect(pullRequestUrl('ssh://git@github.com:7999/o/r.git', 'b')).toBe(
      'https://github.com/o/r/compare/b?expand=1',
    );
  });

  it('strips .git even behind a trailing slash', () => {
    expect(pullRequestUrl('https://github.com/o/r.git/', 'b')).toBe(
      'https://github.com/o/r/compare/b?expand=1',
    );
  });

  it('returns null for unknown forges and unparseable urls', () => {
    expect(pullRequestUrl('https://gitea.example.com/o/r.git', 'main')).toBeNull();
    expect(pullRequestUrl('/local/path/repo', 'main')).toBeNull();
    expect(pullRequestUrl('https://github.com/o/r.git', '')).toBeNull();
    expect(pullRequestUrl('https://bitbucket.company.com/other/path.git', 'main')).toBeNull();
  });
});
