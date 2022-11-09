import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { plugin, initialize } from '../src';

let uri: string | null = null;

let mongod: MongoMemoryServer;

let connection: typeof mongoose.connection | null = null;

beforeAll(async done => {
  mongod = await MongoMemoryServer.create();
  uri = mongod.getUri();
  connection = mongoose.createConnection(uri);
  if (connection) {
    // connection.on('error', console.error.bind(console));
    connection.once('open', function() {
      initialize(connection!);
      done();
    });
  }
});

afterEach(async done => {
  if (connection) {
    connection.deleteModel('User');
    await connection.db.dropDatabase();
  }
  done();
});

afterAll(async done => {
  // const collections = await connection!.db.collections();
  // for (const collection of collections) {
  //   await collection.drop();
  // }
  if (connection) {
    await connection.db.dropDatabase();
    await connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
  done();
});

describe('mongoose-auto-increment', () => {
  it('should increment the _id field on save', async done => {
    const userSchema = new mongoose.Schema({
      name: String,
      dept: String,
    });
    userSchema.plugin<any>(plugin, 'User');
    const User = connection!.model('User', userSchema);
    const user1 = new User({
      name: 'Charlie',
      dept: 'Support',
    });
    const user2 = new User({
      name: 'Charlene',
      dept: 'Marketing',
    });

    // Act
    await user1.save();
    await user2.save();

    // Assert
    expect(user1._id).toBe(0);
    expect(user2._id).toBe(1);
    done();
  });

  it('should increment the specified field instead (Test 2)', async done => {
    // Arrange
    const userSchema = new mongoose.Schema({
      userId: Number,
      name: String,
      dept: String,
    });
    userSchema.plugin(plugin, { model: 'User', field: 'userId' });
    const User = connection!.model('User', userSchema);
    const user1 = new User({ name: 'Charlie', dept: 'Support' });
    const user2 = new User({ name: 'Charlene', dept: 'Marketing' });

    // Act
    await user1.save();
    await user2.save();

    expect(user1.userId).toBe(0);
    expect(user2.userId).toBe(1);
    done();
  });

  it('should start counting at specified number (Test 3)', async done => {
    const userSchema = new mongoose.Schema({
      name: String,
      dept: String,
    });
    userSchema.plugin(plugin, { model: 'User', startAt: 3 });
    const User = connection!.model('User', userSchema);
    const user1 = new User({ name: 'Charlie', dept: 'Support' });
    const user2 = new User({ name: 'Charlene', dept: 'Marketing' });

    // Act
    await user1.save();
    await user2.save();

    expect(user1._id).toBe(3);
    expect(user2._id).toBe(4);
    done();
  });

  it('should increment by the specified amount (Test 4)', async done => {
    // Arrange
    const userSchema = new mongoose.Schema({
      name: String,
      dept: String,
    });

    userSchema.plugin(plugin, { model: 'User', incrementBy: 5 });
    const User = connection!.model('User', userSchema);
    const user1 = new User({ name: 'Charlie', dept: 'Support' });
    const user2 = new User({ name: 'Charlene', dept: 'Marketing' });
    await user1.save();
    await user2.save();

    // Assert
    expect(user1._id).toBe(0);
    expect(user2._id).toBe(5);
    done();
  });
});

describe('helper function', function() {
  it('nextCount should return the next count for the model and field (Test 5)', async done => {
    // Arrange
    var userSchema = new mongoose.Schema({
      name: String,
      dept: String,
    });
    userSchema.plugin<any>(plugin, 'User');
    const User = connection!.model('User', userSchema);
    const user1 = new User({
      name: 'Charlie',
      dept: 'Support',
    });
    const user2 = new User({
      name: 'Charlene',
      dept: 'Marketing',
    });

    // Act
    (user1 as any).nextCount((_err: any, count: number) => {
      expect(count).toBe(0);
    });
    await user1.save();
    expect(user1._id).toBe(0);
    (user1 as any).nextCount((_err: any, count: number) => {
      expect(count).toBe(1);
    });
    await user2.save();
    expect(user2._id).toBe(1);
    (user2 as any).nextCount((_err: any, count: number) => {
      expect(count).toBe(2);
      done();
    });
  });

  it('resetCount should cause the count to reset as if there were no documents yet.', async done => {
    // Arrange
    const userSchema = new mongoose.Schema({
      name: String,
      dept: String,
    });
    userSchema.plugin<any>(plugin, 'User');
    const User = connection!.model('User', userSchema);
    const user = new User({ name: 'Charlie', dept: 'Support' });

    // Act
    await user.save();
    expect(user._id).toBe(0);
    (user as any).nextCount((_err: any, count: number) => {
      expect(count).toBe(1);
    });
    (user as any).resetCount((_err: any, nextCount: number) => {
      expect(nextCount).toBe(0);
    });
    (user as any).nextCount((_err: any, count: number) => {
      expect(count).toBe(0);
      done();
    });
  });
});
