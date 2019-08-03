Skyrus-UI
============
[中文版](README_zh.md)

This is a light wallet that connects to a Skyrus API provided by the *witness_node* executable.


It *stores all keys locally* in the browser, *never exposing your keys to anyone* as it signs transactions locally before transmitting them to the API server which then broadcasts them to the blockchain network. The wallet is encrypted with a password of your choosing and encrypted in a browser database.

## Getting started

Skyrus-UI depends node Node.js, and version 8+ is required.

On Ubuntu and OSX, the easiest way to install Node is to use the [Node Version Manager](https://github.com/creationix/nvm).

To install NVM for Linux/OSX, simply copy paste the following in a terminal:

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
nvm install v9
nvm use v9
```

Once you have Node installed, you can clone the repo:

```
git clone https://github.com/skyrus/skyrus-ui.git
cd skyrus-ui
```

Before launching the GUI you will need to install the npm packages:

```
npm install
```

## Running the dev server

The dev server uses Express in combination with Webpack.

Once all the packages have been installed you can start the development server by running:

```
npm start
```

Once the compilation is done the GUI will be available in your browser at: `localhost:8080` or `127.0.0.1:8080`. Hot Reloading is enabled so the browser will live update as you edit the source files.


## Testnet
By default skyrus-ui connects to the live Skyrus network, but it's very easy to switch it to the testnet run by Xeroc. To do so, open the UI in a browser, go to Settings, then under Access, select the *Public Testnet Server* in the dropdown menu. You should also change the faucet if you need to create an account, the testnet faucet address is https://testnet.skyrus.eu.

The UI will reload and connect to the testnet, where you can use the faucet to create an account and receive an initial sum of test BTS.

![image](https://cloud.githubusercontent.com/assets/6890015/22055747/f8e15e68-dd5c-11e6-84cd-692749b578d8.png)

## Production
If you'd like to host your own wallet somewhere, you should create a production build and host it using NGINX or Apache. In order to create a prod bundle, simply run the following command:

```
npm run build
```
This will create a bundle in the ./build/dist folder that can be hosted with the web server of your choice.


### Installable wallets
We use Electron to provide installable wallets, available for Windows, OSX and Linux Debian platforms such as Ubuntu. First, make sure your local python version is 2.7.x, as a dependency requires this.

On Linux you will need to install the following packages to handle icon generation:

`sudo apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils`

For building, each architecture has it's own script that you can use to build your native binary:

__Linux__
`npm run package-deb`  
__Windows__
`npm run package-win`  
__Mac__
`npm run package-mac`  

This will compile the UI with some special modifications for use with Electron, generate installable binaries with Electron and copy the result to the root `build/binaries` folder.


### Docker

Clone this repository, run `docker-compose up` and visit localhost:8080


## Contributing
Please work off the develop branch and make pull requests to that branch. The master branch will only be updated for new releases.

The Skyrus UI team is supported by this [worker](https://www.skyrus.foundation/workers/2018-08-skyrus-ui). It provides the funds needed to pay the coordinator and the bounties and the Skyrus Foundation.

If you would like to get involved, we have a [Telegram chatroom](https://t.me/SkyrusDEX) where you can ask questions and get help. You may also join [Skyrus on Discord](https://discord.gg/GsjQfAJ)

- Project Manager: Magnus Anderson, @startail
- Issue and Funds Coordinator: Bill Butler, @billbutler
- Lead Developer: Sigve Kvalsvik, @sigvek

## Development process

- New issues will, after enough discussion and clarification, be assigned an estimate time to complete, as well as assigned to the next unstarted milestone, by a project coordinator.
- Milestones are numbered YYMMDD and refer to the **anticipated release date of the next Release Candidate**.
- Release Candidates sits 1-2 weeks for evaluation by the public before release
- Bugs are always worked before enhancements
- Developers should work each issue according to a numbered branch corresponding to the issue `git checkout -b 123`
- We pay **bounties** for issues that have been estimated. An estimated issue is prefixed with a number in brackets like this: `[2] An nasty bug`. In this example, the bug is valued at two hours ($125 per hour). If you fix this issue according to these guidelines and your PR is accepted, this will earn you $250 bitUSD. You must have a Skyrus wallet and a Skyrus account to receive payment.
- To claim an issue, simply leave a comment with your request to work on it.
- If an issue is already claimed (assigned), do not attempt to claim it. Issues claimed by outside developers will have no assigned dev, but have the developers name in brackets.
- Do not claim an issue if you will be unable to complete it by the date indicated on the Milestone name. Milestone 170901 will be pushed on September 1, 2017.
- If an issue missed the intended milestone completion, be sure to make a comment on your progress including the reason for the delay. The issue is pushed to the next milestone. Failing to comment or complete the issue once more will result in release of the assigned issue.

**Please keep comments constructive and clean**

The Skyrus UI is integrated with BrowserStack (https://www.browserstack.com) to allow manual compatibility testing across devices and browser versions. In the future we will switch to a automated Selenium testing framework.
![image](https://user-images.githubusercontent.com/33128181/48697885-05f8d880-ebe6-11e8-95a2-d87516cbb3d9.png)

## Release Branches
Development is processed through milestones, by 2 week intervals.
There are three branches that forms the current release process.

### Develop
All PRs should be pushed to the `develop` branch. At the end of each milestone this branch is pushed to `staging`.
New commits are automatically deployed to this branch and published for review.

Available for browsing on https://develop.skyrus.org/

### Staging (Current Release Candidate)
At the end of each milestone, `develop` branch is pushed to staging and forms the Release Candidate. Milestone 180601 forms the 180615-RC*.

Application breaking issues and bugs should be submitted to the issue tracker. PRs should be pushed to `staging`.

New commits are automatically deployed to this branch and published for review.

Available for browsing on https://staging.skyrus.org/

### Master (stable)
When all issues to the current RC, `staging` branch is released to the stable `master` branch.

Available for browsing on https://wallet.skyrus.org/, which is the official reference wallet for Skyrus.


## Coding style guideline

Our style guideline is based on 'Airbnb JavaScript Style Guide' (https://github.com/airbnb/javascript), with few exceptions:

- Strings are double quoted
- Additional trailing comma (in arrays and objects declaration) is optional
- 4 spaces tabs
- Spaces inside curly braces are optional

We strongly encourage to use _eslint_ to make sure the code adhere to our style guidelines.
