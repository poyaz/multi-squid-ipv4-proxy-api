/**
 * Created by pooya on 2/16/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const ServerModel = require('~src/core/model/serverModel');
const IpAddressModel = require('~src/core/model/ipAddressModel');
const PackageModel = require('~src/core/model/packageModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`FindClusterPackageService`, () => {
  setup(() => {
    const {
      packageService,
      serverService,
      serverApiRepository,
      findClusterPackageService,
    } = helper.fakeFindClusterPackageService();

    testObj.packageService = packageService;
    testObj.serverService = serverService;
    testObj.serverApiRepository = serverApiRepository;
    testObj.findClusterPackageService = findClusterPackageService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Get all package by username`, () => {
    test(`Should error get all package in all instance when get all instance has fail`, async () => {
      const inputUsername = 'user1';
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.getAllByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get all package in current instance because not found any server`, async () => {
      const inputUsername = 'user1';
      testObj.serverService.getAll.resolves([null, []]);
      testObj.packageService.getAllByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.getAllByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.getAllByUsername.should.have.callCount(1);
      testObj.packageService.getAllByUsername.should.have.calledWith(sinon.match(inputUsername));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful get all package in current instance because not found any server`, async () => {
      const inputUsername = 'user1';
      testObj.serverService.getAll.resolves([null, []]);
      testObj.packageService.getAllByUsername.resolves([null, []]);

      const [error, result] = await testObj.findClusterPackageService.getAllByUsername(
        inputUsername,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.getAllByUsername.should.have.callCount(1);
      testObj.packageService.getAllByUsername.should.have.calledWith(sinon.match(inputUsername));
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should error get all package in all instance when send request has been fail`, async () => {
      const inputUsername = 'user1';
      const outputServerModel1 = new ServerModel();
      outputServerModel1.name = 'server-1';
      outputServerModel1.hostIpAddress = '10.10.10.1';
      outputServerModel1.hostApiPort = 8080;
      outputServerModel1.isEnable = true;
      const outputServerModel2 = new ServerModel();
      outputServerModel2.name = 'server-2';
      outputServerModel2.hostIpAddress = '10.10.10.2';
      outputServerModel2.hostApiPort = 8080;
      outputServerModel2.isEnable = false;
      const outputServerModel3 = new ServerModel();
      outputServerModel3.name = 'server-3';
      outputServerModel3.hostIpAddress = '10.10.10.3';
      outputServerModel3.hostApiPort = 8080;
      outputServerModel3.isEnable = true;
      testObj.serverService.getAll.resolves([
        null,
        [outputServerModel1, outputServerModel2, outputServerModel3],
      ]);
      testObj.serverApiRepository.getAllPackageByUsername
        .onCall(0)
        .resolves([null, new PackageModel()])
        .onCall(1)
        .resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.getAllByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.serverApiRepository.getAllPackageByUsername.should.have.callCount(2);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful get all package in all instance`, async () => {
      const inputUsername = 'user1';
      const outputServerModel1 = new ServerModel();
      outputServerModel1.name = 'server-1';
      outputServerModel1.hostIpAddress = '10.10.10.1';
      outputServerModel1.hostApiPort = 8080;
      outputServerModel1.isEnable = true;
      const outputServerModel2 = new ServerModel();
      outputServerModel2.name = 'server-2';
      outputServerModel2.hostIpAddress = '10.10.10.2';
      outputServerModel2.hostApiPort = 8080;
      outputServerModel2.isEnable = false;
      const outputServerModel3 = new ServerModel();
      outputServerModel3.name = 'server-3';
      outputServerModel3.hostIpAddress = '10.10.10.3';
      outputServerModel3.hostApiPort = 8080;
      outputServerModel3.isEnable = true;
      testObj.serverService.getAll.resolves([
        null,
        [outputServerModel1, outputServerModel2, outputServerModel3],
      ]);
      const outputPackageModel1 = new PackageModel();
      outputPackageModel1.id = testObj.identifierGenerator.generateId();
      outputPackageModel1.userId = testObj.identifierGenerator.generateId();
      outputPackageModel1.username = 'user1';
      outputPackageModel1.countIp = 3;
      outputPackageModel1.ipList = [
        { ip: '192.168.1.2', port: 8080 },
        { ip: '192.168.1.3', port: 8080 },
        { ip: '192.168.1.4', port: 8080 },
      ];
      outputPackageModel1.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      const outputPackageModel2 = new PackageModel();
      outputPackageModel2.id = testObj.identifierGenerator.generateId();
      outputPackageModel2.userId = testObj.identifierGenerator.generateId();
      outputPackageModel2.username = 'user1';
      outputPackageModel2.countIp = 3;
      outputPackageModel2.ipList = [
        { ip: '192.168.1.2', port: 8080 },
        { ip: '192.168.1.5', port: 8080 },
        { ip: '192.168.1.6', port: 8080 },
      ];
      outputPackageModel2.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      testObj.serverApiRepository.getAllPackageByUsername
        .onCall(0)
        .resolves([null, [outputPackageModel1]])
        .onCall(1)
        .resolves([null, [outputPackageModel2]]);

      const [error, result] = await testObj.findClusterPackageService.getAllByUsername(
        inputUsername,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.serverApiRepository.getAllPackageByUsername.should.have.callCount(2);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[0].countIp).to.be.equal(5);
      expect(result[0].ipList[0]).to.have.include({ ip: '192.168.1.2', port: 8080 });
      expect(result[0].ipList[1]).to.have.include({ ip: '192.168.1.3', port: 8080 });
      expect(result[0].ipList[2]).to.have.include({ ip: '192.168.1.4', port: 8080 });
      expect(result[0].ipList[3]).to.have.include({ ip: '192.168.1.5', port: 8080 });
      expect(result[0].ipList[4]).to.have.include({ ip: '192.168.1.6', port: 8080 });
    });
  });
});
