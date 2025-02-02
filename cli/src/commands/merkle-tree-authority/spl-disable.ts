import { Command } from "@oclif/core";
import {
  CustomLoader,
  getWalletConfig,
  setAnchorProvider,
} from "../../utils/utils";

class SplDisableCommand extends Command {
  static description = "Disable permissionless SPL tokens.";

  static examples = ["light merkle-tree-authority:spl-disable"];

  async run() {
    const loader = new CustomLoader("Disabling permissionless SPL tokens");
    loader.start();

    const { connection } = await setAnchorProvider();
    let merkleTreeConfig = await getWalletConfig(connection);

    await merkleTreeConfig.enablePermissionlessSplTokens(false);

    loader.stop(false);
    this.log(
      "Permissionless SPL tokens disabled successfully \x1b[32m✔\x1b[0m"
    );
  }
}

export default SplDisableCommand;
