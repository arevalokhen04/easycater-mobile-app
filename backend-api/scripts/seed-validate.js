/**
 * Validates the seed fixtures against the Mongoose schemas without a live
 * MongoDB connection. Stubs out connect/delete/create, captures every write,
 * then runs schema validation over the captured documents.
 */
const path = require('path');
const mongoose = require('mongoose');

const SRC = path.join(__dirname, '../src');

// ---- stub the database -----------------------------------------------------
let oid = 0;
const fakeId = () => new mongoose.Types.ObjectId();

mongoose.connect = async () => ({ connection: { host: 'stub', name: 'stub', readyState: 1 } });
mongoose.connection.close = async () => {};

// seed.js calls process.exit() on completion - trap it so validation can run first.
const realExit = process.exit.bind(process);
process.exit = () => {};

const captured = [];
const attach = (model) => {
  model.deleteMany = async () => ({ deletedCount: 0 });
  const record = (Model, inputs) => {
    // Mirror what mongoose hands back: a hydrated doc carrying its own fields plus _id.
    for (const input of [].concat(inputs)) {
      captured.push({ model: Model.modelName, data: input });
    }
    return Promise.resolve([].concat(inputs).map((input) => ({ ...input, _id: fakeId() })));
  };
  model.create = (inputs) => record(model, inputs);
  model.insertMany = (inputs) => record(model, inputs);
};

// ---- run the real seed -----------------------------------------------------
for (const name of ['User', 'Package', 'MenuItem', 'Booking', 'Payment', 'Notification']) {
  attach(require(path.join(SRC, 'models', `${name}.js`)));
}

require(path.join(SRC, 'utils', 'seed.js'));

setTimeout(async () => {
  const models = mongoose.models;
  let bad = 0;

  for (const { model, data } of captured) {
    const Model = models[model];
    try {
      // Instantiate so pre('validate') hooks (slug, booking number) run first.
      await new Model(data).validate({ hooks: true });
    } catch (err) {
      bad++;
      console.log(`FAIL ${model}: ${JSON.stringify(data).slice(0, 90)}`);
      console.log(`     ${err.message}`);
    }
  }

  const counts = captured.reduce((acc, c) => ({ ...acc, [c.model]: (acc[c.model] || 0) + 1 }), {});
  console.log('\ncaptured documents:', counts);
  console.log(bad ? `\n${bad} document(s) failed schema validation.` : `\nAll ${captured.length} seed documents validate cleanly.`);
  realExit(bad ? 1 : 0);
}, 3000);
