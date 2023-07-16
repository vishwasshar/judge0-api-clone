const mongoose = require("mongoose");

const schema = mongoose.Schema;


const User = new schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    require: true,
  },
  code: {
    items: [
      {
        codeId: {
          type: schema.Types.ObjectId,
          ref: "Code",
          required: true,
        },
      },
    ],
  },
});

User.methods.addCodeItem = function (codeId) {
  const codeItem = this.code.items;

  codeItem.push({
    codeId,
  });
  this.code = { items: codeItem };
  return this.save();
};

module.exports = mongoose.model("User", User);
