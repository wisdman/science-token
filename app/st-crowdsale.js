;(function() {
  const ADDRESS_RX = /^0x[a-f0-9]{40}$/i

  const FUNCTIONS = {
    b69ef8a8: "balance",
    "8d4e4083": "isFinalized",
    a035b1fe: "price",
    fc0c546a: "token",
    b7dc2a9f: "weiMinimum",
    "4042b66f": "weiRaised",
  }

  const URL = (contract, data) => {
    return `https://api.etherscan.io/api?module=proxy&action=eth_call&to=${contract}&data=${data}`
  }

  class STCrowdsale {
    static HEX2DEC(s) {
      function add(x, y) {
        let c = 0
        let r = []
        x = x.split("").map(Number)
        y = y.split("").map(Number)
        while (x.length || y.length) {
          let s = (x.pop() || 0) + (y.pop() || 0) + c
          r.unshift(s < 10 ? s : s - 10)
          c = s < 10 ? 0 : 1
        }
        if (c) {
          r.unshift(c)
        }
        return r.join("")
      }

      let dec = "0"
      s.split("").forEach((chr) => {
        let n = parseInt(chr, 16)
        for (let t = 8; t; t >>= 1) {
          dec = add(dec, dec)
          if (n & t) dec = add(dec, "1")
        }
      })

      return dec
    }

    constructor(contract) {
      if (typeof contract !== "string" || !ADDRESS_RX.test(contract)) {
        throw new TypeError("Incorrect Ethereum Address")
      }
      this._contract = contract

      this._asyncInit = new Promise((resolve) => {
        const readyHandler = () => {
          if (document.readyState === "complete") {
            resolve(true)
          }
        }

        document.addEventListener("readystatechange", readyHandler)
        readyHandler()
      })

      for (let key in FUNCTIONS) {
        this[FUNCTIONS[key]] = () => {
          return fetch(URL(this._contract, key))
            .then((value) => value.json())
            .then((value) => value.result)
        }
      }
    }

    async asyncInit() {
      return this._asyncInit
    }

    async checkProvider() {
      await this.asyncInit()

      if (typeof window.Web3 !== "function") {
        throw new Error("Ethereum provider is not found")
      }

      this.web3 = new Web3(web3.currentProvider)
      const coinbase = this.web3.eth.coinbase

      if (typeof coinbase !== "string") {
        throw new Error("Ethereum provider has unknown address")
      }

      const ballance = await (() => {
        return new Promise((resolve, reject) => {
          this.web3.eth.getBalance(coinbase, (error, ballance) => {
            if (error) {
              reject(error)
            } else {
              resolve(ballance.toNumber())
            }
          })
        })
      })()

      if (Number.isNaN(ballance)) {
        throw new Error("Ethereum provider internal error")
      }

      return true
    }

    get from() {
      return this.web3.eth.coinbase
    }

    get to() {
      return this._contract
    }

    async payment(amount) {
      await this.asyncInit()
      await this.checkProvider()

      amount = parseFloat(amount)
      console.dir(amount)
      if (Number.isNaN(amount) || amount <= 0) {
        throw new TypeError("Incorrect amount value")
      }

      const transaction = {
        to: this._contract,
        value: this.web3.toWei(amount, "ether"),
      }

      const result = await (() => {
        return new Promise((resolve) => {
          this.web3.eth.sendTransaction(transaction, (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          })
        })
      })()

      return result
    }
  }

  window.STCrowdsale = STCrowdsale
})()
