#!/bin/bash
source test/prelude.sh

cat <<EOL

You can access groestlcoind and lightningd via:

  $ groestlcoin-cli --datadir=$GRS_DIR
  $ lightning-cli --rpc-file=$LN_ALICE_PATH/lightning-rpc
  $ lightning-cli --rpc-file=$LN_BOB_PATH/lightning-rpc

Groestlcoin Lightning Charge is available at:

  $CHARGE_URL

You can run the unit tests against the running services with:

  $ CHARGE_URL=$CHARGE_URL LN_BOB_PATH=$LN_BOB_PATH npm test

EOL

read -p 'Press enter to shutdown and clean up'
source test/teardown.sh
