import * as mongodb from "mongodb";
import * as OIdCProvider from "oidc-provider";
import { _configuration, _logger } from "./index" 

const grantable = new Set([
  "access_token",
  "authorization_code",
  "refresh_token",
  "device_code",
  "backchannel_authentication_request",
]);

export class MongoAdapter implements OIdCProvider.Adapter
{
  public static client: mongodb.MongoClient | undefined = undefined;
  public static database: mongodb.Db | undefined = undefined;

  // ajm: -----------------------------------------------------------------------------------------
  public constructor(public name: string) {
    _logger.LogDebug(`MongoAdapter.constructor(${this.name})`);
    // this.index();
  }

  // ajm: -----------------------------------------------------------------------------------------
  public static async connect(uri: string): Promise<void> {
    try {
      _logger.LogDebug(`MongoAdapter[${this.name}].connect(${uri})`);
      MongoAdapter.client = await mongodb.MongoClient.connect(uri);
      await MongoAdapter.client?.db("sunstealer-identity").dropDatabase();
      MongoAdapter.database = MongoAdapter.client?.db("sunstealer-identity");
      if (!MongoAdapter.database) {
        _logger.LogError("!sunstealer-identity");
      }
      // this.index();
    } catch(e) {
      _logger.LogException(e);
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public async consume(_id: string): Promise<void> {
    try {
      _logger.LogDebug(`MongoAdapter[${this.name}].consume(${_id})`);

      const result = await MongoAdapter.database?.collection("default").findOneAndUpdate({ _id }, { $set: { "payload.consumed": Math.floor(Date.now() / 1000) } });
      if (result) {
        _logger.LogDebug(`MongoAdapter.consume : ${JSON.stringify(result, null, 2)}`);
      } else {
        _logger.LogWarning(`MongoAdapter.consume : ${JSON.stringify(result, null, 2)}`);
      }

    } catch(e) {
      _logger.LogException(e);
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public async destroy(_id: string): Promise<void> {
    try {
      _logger.LogDebug(`MongoAdapter[${this.name}].destroy(${_id})`);

      const result = await MongoAdapter.database?.collection(this.name).deleteOne({ _id });
      if (result) {
        _logger.LogDebug(`MongoAdapter.destroy : ${JSON.stringify(result, null, 2)}`);    
      } else {
        _logger.LogWarning(`MongoAdapter.destroy : ${JSON.stringify(result, null, 2)}`);    
      }
    } catch(e) {
      _logger.LogException(e);
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public async find(_id: string): Promise<OIdCProvider.AdapterPayload | undefined> {
    try {
      _logger.LogDebug(`MongoAdapter[${this.name}].find(${_id})`);

      const result = await MongoAdapter.database?.collection(this.name).find({ _id }).limit(1).next();
      if (result) {
        _logger.LogDebug(`MongoAdapter[${this.name}].find(${_id}) : ${JSON.stringify(result, null, 2)}`);
      } else {
        _logger.LogWarning(`MongoAdapter[${this.name}].find(${_id}) : ${JSON.stringify(result, null, 2)}`);
      }

      return result ? result : undefined;
    } catch(e) {
      _logger.LogException(e);
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public async findByUid(uid: string): Promise<OIdCProvider.AdapterPayload | undefined> {
    try {
      _logger.LogDebug(`MongoAdapter[${this.name}].findByUid(${uid})`);      
      
      const result = await MongoAdapter.database?.collection(this.name).find({ uid }).limit(1).next();
      if (result) {
        _logger.LogDebug(`MongoAdapter[${this.name}].findByUid(${uid}) : ${JSON.stringify(result, null, 2)}`);
      } else {
        _logger.LogDebug(`MongoAdapter[${this.name}].findByUid(${uid}) : ${JSON.stringify(result, null, 2)}`);
      }

      return result ? result : undefined;
    } catch(e) {
      _logger.LogException(e);
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public async findByUserCode(userCode: string): Promise<OIdCProvider.AdapterPayload | undefined> {
    try {
      _logger.LogDebug(`MongoAdapter[${this.name}].findByUserCode(${userCode})`);

      const result = await MongoAdapter.database?.collection(this.name).find({ "payload.userCode": userCode }).limit(1).next();
      if (result) {
        _logger.LogDebug(`MongoAdapter[${this.name}].findByUserCode() : ${JSON.stringify(result, null, 2)}`);
      } else {
        _logger.LogWarning(`MongoAdapter[${this.name}].findByUserCode() : ${JSON.stringify(result, null, 2)}`);
      }
      return result ? result.session : undefined;
    } catch(e) {
      _logger.LogException(e);
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public async index(): Promise<void> {
    try {
      _logger.LogDebug(`MongoAdapter[${this.name}].index()`);

      MongoAdapter.database?.collection(this.name).createIndexes([
        ...(grantable.has(this.name)
          ? [{
            key: { 'payload.grantId': 1 },
          }] : []),
        ...(this.name === 'device_code'
          ? [{
            key: { 'payload.userCode': 1 },
            unique: true,
          }] : []),
        ...(this.name === 'session'
          ? [{
            key: { 'payload.uid': 1 },
            unique: true,
          }] : []),
        {
          key: { expiresAt: 1 },
          expireAfterSeconds: 0,
        }
      ]).catch((e) => {
        _logger.LogException(e);
      });
    } catch(e) {
      _logger.LogException(e);
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public async revokeByGrantId(grantId: string): Promise<void> {
    try {
      _logger.LogDebug(`MongoAdapter[${this.name}].revokeByGrantId(${grantId})`);

      const result = await MongoAdapter.database?.collection(this.name).deleteMany({ 'payload.grantId': grantId });
      if (result) {
        _logger.LogDebug(`MongoAdapter[${this.name}].revokeByGrantId() : ${JSON.stringify(result, null, 2)}`);
      } else {
        _logger.LogWarning(`MongoAdapter[${this.name}].revokeByGrantId() : ${JSON.stringify(result, null, 2)}`);
      }
    } catch(e) {
      _logger.LogException(e);
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public async upsert(_id: string, payload: OIdCProvider.AdapterPayload, expiresIn: number): Promise<undefined | void> {
    try {
      _logger.LogDebug(`MongoAdapter[${this.name}].upsert(${_id} ${JSON.stringify(payload, null, 2)} ${expiresIn})`);

      let expiresAt: Date | undefined = undefined;
      if (expiresIn) {
        payload.expiresAt = new Date(Date.now() + (expiresIn * 1000));
      }
 
      const result = await MongoAdapter.database?.collection(this.name).updateOne({ _id }, { $set: payload}, { upsert: true });
      if (result) {
        _logger.LogDebug(`MongoAdapter[${this.name}].upsert() : ${JSON.stringify(result, null, 2)}`);
      } else {
        _logger.LogWarning(`MongoAdapter[${this.name}].upsert() : ${JSON.stringify(result, null, 2)}`);
      }
    } catch(e) {
      _logger.LogException(e);
    }
  }
}