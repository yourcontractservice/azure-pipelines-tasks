import os = require('os');
import { TaskMockRunner } from 'azure-pipelines-task-lib/mock-run';

export class MocksRegistrator {
    public static register(tr: TaskMockRunner) {
        let secureFileHelperMock = require('./secure-files-mock.js');
        tr.registerMock('securefiles-common/securefiles-common', secureFileHelperMock);

        class MockStats {
            mode = 600;
        };
        class MockUser {
            username = "testUser";
        };

        tr.registerMock('fs', {
            writeFileSync: function (filePath, contents) {
            },
            existsSync: function (filePath, contents) {
                return true;
            },
            readFileSync: function (filePath) {
                return 'contents';
            },
            statSync: function (filePath) {
                let s: MockStats = new MockStats();
                return s;
            },
            chmodSync: function (filePath, string) {

            }
        });

        tr.registerMock('os', {
            userInfo: function () {
                let user: MockUser = new MockUser();
                return user;
            },
            type: function () {
                return os.type();
            },
            homedir: function () {
                return os.homedir();
            }
        });

    }
}