import React from "react";
import AccountStore from "stores/AccountStore";
import AltContainer from "alt-container";
import Accounts from "./Accounts";

class AccountsContainer extends React.Component {
    render() {
        return (
            <AltContainer
                stores={[AccountStore]}
                inject={{
                    searchAccounts: () => {
                        return AccountStore.getState().searchAccounts;
                    },
                    searchTerm: () => {
                        return AccountStore.getState().searchTerm;
                    }
                }}
            >
                <Accounts />
            </AltContainer>
        );
    }
}

export default AccountsContainer;
