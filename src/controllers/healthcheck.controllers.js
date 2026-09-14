import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const healthcheck = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new Apiresponse(200, { status: "OK" }, "Server is running fine"));
});

export { healthcheck };