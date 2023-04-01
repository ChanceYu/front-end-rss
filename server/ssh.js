const fs = require('fs-extra')
const shell = require('shelljs')

if (fs.pathExistsSync('/root/.ssh/github')) {
    shell.exec('eval $(ssh-agent) && ssh-add /root/.ssh/github')
}
