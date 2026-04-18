set myPath to POSIX path of (path to me)
set scriptCmd to "cd \"$(dirname " & quoted form of myPath & ")\" && export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin && npm run electron:dev"
do shell script scriptCmd
