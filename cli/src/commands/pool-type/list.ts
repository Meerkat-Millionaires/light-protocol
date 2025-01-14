import { Command, ux } from "@oclif/core";
import { Program } from "@coral-xyz/anchor";
import { CustomLoader, setAnchorProvider } from "../../utils";
import {
  IDL_MERKLE_TREE_PROGRAM,
  merkleTreeProgramId,
} from "@lightprotocol/zk.js";

class PoolTypeListCommand extends Command {
  static description = "List pool types.";

  static examples = ["light pool-type:list"];

  async run() {
    const loader = new CustomLoader("Listing pool types");
    loader.start();

    const provider = await setAnchorProvider();
    const merkleTreeProgram = new Program(
      IDL_MERKLE_TREE_PROGRAM,
      merkleTreeProgramId,
      provider
    );

    const poolTypes = await merkleTreeProgram.account.registeredPoolType.all();

    loader.stop(false);
    ux.table(poolTypes, {
      type: {
        header: "Type",
        get: (account) => account.account.poolType,
      },
    });
  }
}

export default PoolTypeListCommand;
