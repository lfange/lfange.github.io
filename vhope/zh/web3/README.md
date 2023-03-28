# 与时俱进 web3

## introduction

要开始在 Web3 中构建应用程序，依然需要了解 Web2 的技术知识，例如你编写了一份智能合约，依然需要为你的用户提供一种与之交互的界面。此外，如果你想在智能合约之外存储一些数据，就要用到数据库等，这些概念，与之完全等效。在网络上，前端是指可浏览的网页，而目前传统的协作方式是将私有数据，用户数据，业务逻辑，数据处理等放置在后端处理，这也是人们常说的 Web2 技术栈。

Web 3.0 的概念是由以太坊联合创始人 Gavin Wood 在 2014 年提出的，指基于区块链的去中心化在线生态系统，它代表了下一代互联网时代。目前 Web 3.0 仍处于起步阶段，但是发展非常迅猛，其去中心化、抗审查等特点使得人们更容易建设一个开放的网络生态。本文会先对 Web3.0 的底层区块链做个简单介绍，然后再介绍 Web3.0 的整体架构，最后通过一个简单的例子来介绍 Web3.0 开发常用的一些技术。本文只是一个引子，让大家对 Web3.0 不再陌生，文中提到的一些技术感兴趣的同学可以再自行深入了解。

[vercel](https://vercel.com/)

## 什么是区块链

区块链是计算机网络上多个节点之间共享数据的数据库，它们以一种不能被修改的方式记录数据。就像它的名字，区块链将数据记录为一个区块，每一个区块包含一组交易，这些交易可以在网络上广播资产的交易，也可以更新存储在区块链上的数据。

[比特币白皮书](https://bitcoin.org/files/bitcoin-paper/bitcoin_zh_cn.pdf)

## 什么是以太坊

以太坊是第一个支持智能合约的去中心化区块链，开发人员可以在以太坊网络中构建去中心化应用程序。

[什么是以太坊](https://github.com/ethereum/wiki/wiki/%5BChinese-Simplified%5D-Ethereum-%E7%99%BD%E7%9A%AE%E4%B9%A6%E4%B8%AD%E6%96%87%E7%89%88)

## 什么是 Web3

Web3 是一种概念上的术语。

通常我们用互联网不同时期的状态来形容它，在早期互联网主要为消费者提供在线内容和信息，但不能与之互动，这是只读的。Web2 是我们今天大多数人知道和使用互联网的方式，它是可读写，可交互的。但在 Web2 概念中，有一个问题是在于大量的数据都被巨型互联网公司所控制，比如 Apple 可以从应用下载及应用内购买中抽取 30%的分成，所有的社交网络都存储在不同的数据中心，同时我们也能看到随之而来的关于数据安全，数据隐私方面的担忧，一旦数据被泄露，人们都会成为身份盗窃的受害者。

目前我所理解的 Web3 是一个以开源协议为基础组成的世界，并且由用户来集体管理。正因为如此，Web3 正在通过其去中心化，分布式，开放，无需信任，无需许可等特点来增强我们所知的网络。

[什么是 Web3](https://www.freecodecamp.org/news/what-is-web3/)  
[Web2 与 Web3 的对比](https://ethereum.org/en/developers/docs/web2-vs-web3/)

## 什么是钱包

地址是使用加密技术生成的一串文本，用于表示在区块链上的账户，你可以使用它来发送或接收资产，也可以使用它来与其他应用程序交互，而用于管理它的应用程序也就是钱包了。

[Metamask](https://metamask.io/)

## 参考

[web3 开发入门 字节跳动](https://mp.weixin.qq.com/s/vWbZJiVrcnwd8HeLI3b93A)

[以太坊官网](https://ethereum.org/en/web3/)  
[以太坊开发工具](https://mirror.xyz/icepy.eth/MprhcIQw6iNu-HAUyQN6iiok5GtWX1PTDWlcjxAcXGU)  
[比特币的脚本](https://bitcoindev.network/bitcoin-script-101/)  
[90+ #Ethereum Apps You Can Use Right Now](https://consensys.net/blog/news/90-ethereum-apps-you-can-use-right-now/)  
[ERC20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/)  
[ERC721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/)  
[ERC20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/])ss  
[solidity](https://docs.soliditylang.org/en/v0.8.13/)  
[ERC20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/)  
[MetaMask](https://metamask.io/)  
[浏览器插件](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)  
[Home - Truffle Suite](https://trufflesuite.com/)  
[Embark into the Ether. | Embark](https://framework.embarklabs.io/)  
[Fleek(Build on the New Internet](https://fleek.co/)  
[Remix - Ethereum IDE](https://remix.ethereum.org/)  
[区块链是什么?超级详细，看了无师自通!](http://c.biancheng.net/view/1884.html)  
[Web 3.0 架构不仅是去中心化的，更是模块化的-今日头条](https://www.toutiao.com/article/7092936458687742475/?app=news_article&timestamp=1652096170&use_new_style=1&req_id=2022050919361001021119802307017D5D&group_id=7092936458687742475&share_token=D5DCA805-267F-4D38-B4D0-485CBF53FBE3&tt_from=copy_link&utm_source=copy_link&utm_medium=toutiao_ios&utm_campaign=client_share)  
[Web 3.0 生态全解析：颠覆性的技术变革-今日头条](https://www.toutiao.com/article/7078869546806805028/?app=news_article&timestamp=1652096188&use_new_style=1&req_id=2022050919362801021204403917017E3F&group_id=7078869546806805028&share_token=FEF1EEB9-321E-4E21-A91E-B1922C8DC64C&tt_from=copy_link&utm_source=copy_link&utm_medium=toutiao_ios&utm_campaign=client_share)  
[What is Web3 and why is it important? | ethereum.org](https://ethereum.org/en/web3/)  
[Ethereum Provider API | MetaMask Docs](https://docs.metamask.io/guide/ethereum-provider.html)
