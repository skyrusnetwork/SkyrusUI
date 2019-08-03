import alt from "alt-instance";
import {ChainConfig} from "bitsharesjs-ws";
import counterpart from "counterpart";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";

class TransactionConfirmActions {
    confirm(transaction, resolve, reject) {
        return {transaction, resolve, reject};
    }

    broadcast(transaction, resolve, reject) {
        return dispatch => {
            dispatch({broadcasting: true, closed: true});

            let broadcast_timeout = setTimeout(() => {
                dispatch({
                    broadcast: false,
                    broadcasting: false,
                    error: counterpart.translate("trx_error.expire"),
                    closed: false
                });
                if (reject) reject();
            }, ChainConfig.expire_in_secs * 2000);

            transaction
                .broadcast(() => {
                    dispatch({broadcasting: false, broadcast: true});
                })
                .then(res => {
                    clearTimeout(broadcast_timeout);
                    dispatch({
                        error: null,
                        broadcasting: false,
                        broadcast: true,
                        included: true,
                        trx_id: res[0].id,
                        trx_block_num: res[0].block_num,
                        broadcasted_transaction: true
                    });
                    if (resolve) resolve();
                })
                .catch(error => {
                    console.error(error);
                    clearTimeout(broadcast_timeout);
                    // messages of length 1 are local exceptions (use the 1st line)
                    // longer messages are remote API exceptions (use the 1st line)
                    let splitError = error.message.split("\n");
                    let message = splitError[0];
                    dispatch({
                        broadcast: false,
                        broadcasting: false,
                        error: message,
                        closed: false
                    });
                    if (reject) reject();
                });
        };
    }

    wasBroadcast(res) {
        return res;
    }

    wasIncluded(res) {
        return res;
    }

    close() {
        ZfApi.publish("transaction_confirm_actions", "close");
        return true;
    }

    error(msg) {
        return {error: msg};
    }

    togglePropose() {
        return true;
    }

    proposeFeePayingAccount(fee_paying_account) {
        return fee_paying_account;
    }
}

export default alt.createActions(TransactionConfirmActions);
