/**
 * Created by pooya on 5/24/22.
 */

const ISyncService = require('~src/core/interface/iSyncService');
const SyncModel = require('~src/core/model/syncModel');
const UserModel = require('~src/core/model/userModel');

class SyncService extends ISyncService {
  /**
   * @type {ISyncRepository}
   */
  #syncRepository;
  /**
   * @type {IPackageService}
   */
  #packageService;
  /**
   * @type {IUserService}
   */
  #userService;
  #inProcessTimeLimit = 60 * 1000;

  /**
   *
   * @param {ISyncRepository} syncRepository
   * @param {IPackageService} packageService
   * @param {IUserService} userService
   */
  constructor(syncRepository, packageService, userService) {
    super();

    this.#syncRepository = syncRepository;
    this.#packageService = packageService;
    this.#userService = userService;
  }

  async executePackageHasBeenSynced() {
    const [fetchError, fetchData] = await this.#syncRepository.getListOfPackageNotSynced();
    if (fetchError) {
      return [fetchError];
    }

    const processPackageList = this._getListOfTaskShouldExecute(fetchData);
    for await (const syncModel of processPackageList) {
      const [addError, addData] = await this._addStartSyncData(syncModel);
      if (addError) {
        console.error(`Error to add sync package with ${syncModel.referencesId}`, addError);
        continue;
      }

      const [syncError] = await this.#packageService.syncPackageById(syncModel.referencesId);

      await this._updateSyncResult(syncError, addData);
    }

    return [null];
  }

  async executeOrderHasBeenCanceled() {
    const [fetchError, fetchData] = await this.#syncRepository.getListOfOrderNotCanceled();
    if (fetchError) {
      return [fetchError];
    }

    const processOrderList = this._getListOfTaskShouldExecute(fetchData);
    for await (const syncModel of processOrderList) {
      const [addError, addData] = await this._addStartSyncData(syncModel);
      if (addError) {
        console.error(`Error to add sync package with ${syncModel.referencesId}`, addError);
        continue;
      }

      const [syncError] = await this.#packageService.cancel(syncModel.referencesId);

      await this._updateSyncResult(syncError, addData);
    }

    return [null];
  }

  async executePackageHasBeenExpired() {
    const [fetchError, fetchData] = await this.#syncRepository.getListOfPackageNotExpired();
    if (fetchError) {
      return [fetchError];
    }

    const processPackageList = this._getListOfTaskShouldExecute(fetchData);
    for await (const syncModel of processPackageList) {
      const [addError, addData] = await this._addStartSyncData(syncModel);
      if (addError) {
        console.error(`Error to add sync package with ${syncModel.referencesId}`, addError);
        continue;
      }

      const [syncError] = await this.#packageService.syncPackageById(syncModel.referencesId);

      await this._updateSyncResult(syncError, addData);
    }

    return [null];
  }

  async executeFindInProcessHasBeenExpired() {
    const expireDate = new Date(new Date().getTime() + this.#inProcessTimeLimit);

    const [error, data] = await this.#syncRepository.getListOfInProcessExpired(expireDate);
    if (error) {
      return [error];
    }

    for await (const syncModel of data) {
      const updateSyncModel = new SyncModel();
      updateSyncModel.id = syncModel.id;
      updateSyncModel.status = SyncModel.STATUS_ERROR;

      const [errorUpdate] = await this.#syncRepository.update(updateSyncModel);
      if (errorUpdate) {
        console.error(`Error to update error sync with ${syncModel.id}`, errorUpdate);
      }
    }

    return [null];
  }

  async executeUserHasBeenSynced() {
    const [fetchError, fetchData] = await this.#syncRepository.getListOfUserNotSynced();
    if (fetchError) {
      return [fetchError];
    }

    const processPackageList = this._getListOfTaskShouldExecute(fetchData);
    for await (const syncModel of processPackageList) {
      const [addError, addData] = await this._addStartSyncData(syncModel);
      if (addError) {
        console.error(`Error to add sync package with ${syncModel.referencesId}`, addError);
        continue;
      }

      const [fetchUserError, fetchUserData] = await this.#userService.getUserById(
        syncModel.referencesId,
      );
      if (fetchUserError) {
        await this._updateSyncResult(fetchUserError, addData);
        continue;
      }

      const [updatePasswordError] = await this.#userService.changePassword(
        fetchUserData.username,
        fetchUserData.password,
      );

      await this._updateSyncResult(updatePasswordError, addData);
    }

    return [null];
  }

  _getListOfTaskShouldExecute(syncTaskList) {
    const maxTimeout = new Date(new Date().getTime() + this.#inProcessTimeLimit);

    return syncTaskList.filter(
      (v) =>
        [SyncModel.STATUS_PROCESS, SyncModel.STATUS_SUCCESS, SyncModel.STATUS_FAIL].indexOf(
          v.status,
        ) === -1 && v.insertDate.getTime() < maxTimeout,
    );
  }

  /**
   *
   * @param syncModel
   * @return {Promise<(Error|SyncModel)[]>}
   * @private
   */
  async _addStartSyncData(syncModel) {
    const addSyncModel = new SyncModel();
    addSyncModel.referencesId = syncModel.referencesId;
    addSyncModel.serviceName = syncModel.serviceName;
    addSyncModel.status = SyncModel.STATUS_PROCESS;

    return this.#syncRepository.add(addSyncModel);
  }

  async _updateSyncResult(syncError, addData) {
    const updateSyncModel = new SyncModel();
    updateSyncModel.id = addData.id;
    if (syncError) {
      console.error(`Error to execute sync package with ${addData.referencesId}`, syncError);
      updateSyncModel.status = SyncModel.STATUS_ERROR;
    } else {
      updateSyncModel.status = SyncModel.STATUS_SUCCESS;
    }

    const [updateError] = await this.#syncRepository.update(updateSyncModel);
    if (updateError) {
      console.error(`Error to update sync package with ${SyncModel.referencesId}`, updateError);
    }
  }
}

module.exports = SyncService;
