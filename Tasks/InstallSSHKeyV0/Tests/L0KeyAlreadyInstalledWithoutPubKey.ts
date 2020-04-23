import * as ma from 'azure-pipelines-task-lib/mock-answer';
import * as tmrm from 'azure-pipelines-task-lib/mock-run';
import path = require('path');
import os = require('os');

let taskPath = path.join(__dirname, '..', 'preinstallsshkey.js');
let tr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

let sshPublicKey: string = '';
let sshPublicKeyGenerated: string = 'ssh-rsa KEYINFORMATIONHERE';
let sshPublicKeyInstalled: string = 'ssh-rsa KEYINFORMATIONHERE sample@example.com';
tr.setInput('sshKeySecureFile', 'mySecureFileId');
tr.setInput('sshPublicKey', sshPublicKey);
tr.setInput('hostName', 'host name entry');

process.env['AGENT_VERSION'] = '2.117.0';
process.env['AGENT_HOMEDIRECTORY'] = '';

let secureFileHelperMock = require('securefiles-common/securefiles-common-mock');
tr.registerMock('securefiles-common/securefiles-common', secureFileHelperMock);

tr.registerMock('fs', {
    writeFileSync: function (filePath, contents) {
    }
});

class MockUser {
    username = "testUser";
};

tr.registerMock('os' , {
    userInfo: function() {
        let user: MockUser = new MockUser();
        return user;
    },
    type: function() {
        return os.type();
    },
    homedir: function() {
        return os.homedir();
    }
});

// provide answers for task mock
let a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    "which": {
        "security": "/usr/bin/security",
        "ssh-agent": "/usr/bin/ssh-agent",
        "ssh-add": "/usr/bin/ssh-add",
        "rm": "/bin/rm",
        "cp": "/bin/cp",
        "icacls": "/bin/icacls",
        "ssh-keygen": "/usr/bin/ssh-keygen"
    },
    "checkPath": {
        "/usr/bin/security": true,
        "/usr/bin/ssh-agent": true,
        "/usr/bin/ssh-add": true,
        "/bin/rm": true,
        "/bin/cp": true,
        "/bin/icacls": true,
        "/usr/bin/ssh-keygen": true,
    },
    "exist": {
        "/build/temp/mySecureFileId.filename": true
    },
    "exec": {
        "/usr/bin/security cms -D -i /build/temp/mySecureFileId.filename": {
            "code": 0,
            "stdout": "ssh key details here"
        },
        "/usr/bin/ssh-agent": {
            "code": 0,
            "stdout": "SSH_AUTH_SOCK=/tmp/ssh-XVblDhTvcbC3/agent.24196; export SSH_AUTH_SOCK; SSH_AGENT_PID=4644; export SSH_AGENT_PID; echo Agent pid 4644;"
        },
        "/usr/bin/ssh-add": {
            "code": 0,
            "stdout": ""
        },
        "/usr/bin/ssh-add -L": {
            "code": 0,
            "stdout": sshPublicKeyInstalled
        },
        "/bin/icacls /build/temp/mySecureFileId.filename /inheritance:r" : {
            "code": 0,
            "stdout": ""
        },
        "/bin/icacls /build/temp/mySecureFileId.filename /grant:r testUser:(F)" : {
            "code": 0,
            "stdout": ""
        },
        "/usr/bin/ssh-keygen -y -f /build/temp/mySecureFileId.filename" : {
            "code": 0,
            "stdout": sshPublicKeyGenerated
        }
    }
};
tr.setAnswers(a);

tr.run();

