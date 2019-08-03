import alt from "alt-instance";

class PrivateKeyActions {
    addKey(private_key_object, transaction) {
        // returned promise is deprecated
        return dispatch => {
            return new Promise(resolve => {
                dispatch({private_key_object, transaction, resolve});
            });
        };
    }

    loadDbData() {
        // returned promise is deprecated
        return dispatch => {
            return new Promise(resolve => {
                dispatch(resolve);
            });
        };
    }
}

export default alt.createActions(PrivateKeyActions);
