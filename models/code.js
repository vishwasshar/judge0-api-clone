const mongoose = require("mongoose");
const schema = mongoose.Schema;

const submissionSchema = new schema({
  title: {
    type: String,
    require: true,
  },
  code: {
    type: String,
    require: true,
  },
  userID: {
    type: schema.Types.ObjectId,
    ref: "User",
    require: true,
    default: "64aeba110bc2a970d427f2b1",
  },
});

module.exports = mongoose.model("Code", submissionSchema);
