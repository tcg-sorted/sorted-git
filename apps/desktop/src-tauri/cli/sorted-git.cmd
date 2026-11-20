@echo off
REM sorted-git-cli
setlocal EnableExtensions
set "EXE=@APP@"
if "%~1"=="" goto open_cwd
if /I "%~1"=="-h" goto help
if /I "%~1"=="--help" goto help
if /I "%~1"=="help" goto help
if /I "%~1"=="open" goto open_cmd
if /I "%~1"=="clone" goto clone_cmd
if not exist "%~1" (
  echo sorted-git: %~1: no such file or directory 1>&2
  exit /b 1
)
start "" "%EXE%" --open "%~f1"
exit /b 0

:open_cwd
start "" "%EXE%" --open "%CD%"
exit /b 0

:open_cmd
if "%~2"=="" goto open_cwd
if /I "%~2"=="-h" goto help
if /I "%~2"=="--help" goto help
if not exist "%~2" (
  echo sorted-git: %~2: no such file or directory 1>&2
  exit /b 1
)
start "" "%EXE%" --open "%~f2"
exit /b 0

:clone_cmd
shift
set "BRANCH="
set "URL="
:clone_loop
if "%~1"=="" goto clone_run
if /I "%~1"=="-h" goto help
if /I "%~1"=="--help" goto help
if /I "%~1"=="-b" goto clone_branch
if /I "%~1"=="--branch" goto clone_branch
set "URL=%~1"
shift
goto clone_loop

:clone_branch
if "%~2"=="" (
  echo sorted-git: clone: missing branch after %~1 1>&2
  exit /b 1
)
set "BRANCH=%~2"
shift
shift
goto clone_loop

:clone_run
if "%URL%"=="" (
  echo sorted-git: clone: missing url or owner/repo 1>&2
  goto help_err
)
if "%BRANCH%"=="" (
  start "" "%EXE%" --clone "%URL%" --into "%CD%"
) else (
  start "" "%EXE%" --clone "%URL%" --into "%CD%" --branch "%BRANCH%"
)
exit /b 0

:help
echo Usage:
echo   sorted-git                           Open the current directory
echo   sorted-git open [path]               Open the provided path
echo   sorted-git clone [-b branch] ^<url^>   Clone the repository by url or owner/repo
echo                                        ^(ex torvalds/linux^), optionally checking out
echo                                        the branch
echo.
echo sgit is a short alias for sorted-git
exit /b 0

:help_err
echo Usage:
echo   sorted-git                           Open the current directory
echo   sorted-git open [path]               Open the provided path
echo   sorted-git clone [-b branch] ^<url^>   Clone the repository by url or owner/repo
echo                                        ^(ex torvalds/linux^), optionally checking out
echo                                        the branch
echo.
echo sgit is a short alias for sorted-git
exit /b 1
