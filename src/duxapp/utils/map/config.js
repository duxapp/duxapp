import { userConfig } from "../../config/userConfig";

export const mapConfig = {
  appKeyAndroid: "",
  appKeyIos: "",
  h5Key: "",
  apiKey: "",
  ...userConfig.option.duxapp?.map,
};
