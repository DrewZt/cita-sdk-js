'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const Signature = require('elliptic/lib/elliptic/ec/signature')
const blockchainPb = require('../proto-js/blockchain_pb')
const index_1 = require('./index')
const unsigner = hexUnverifiedTransaction => {
  const bytesUnverifiedTransaction = index_1.hex2bytes(hexUnverifiedTransaction)
  const unverifiedTransaction = blockchainPb.UnverifiedTransaction.deserializeBinary(
    bytesUnverifiedTransaction
  )
  const transactionPb = unverifiedTransaction.getTransaction()
  const signature = unverifiedTransaction.getSignature()
  const version = transactionPb.getVersion()
  const transaction = {
    version,
    data: index_1.bytes2hex(transactionPb.getData()),
    chainId: transactionPb.getChainId(),
    to: transactionPb.getTo(),
    nonce: transactionPb.getNonce(),
    value: +index_1.bytes2hex(transactionPb.getValue()),
    quota: transactionPb.getQuota(),
    validUntilBlock: +transactionPb.getValidUntilBlock()
  }
  switch (+version) {
    case 0: {
      break
    }
    case 1:
    case 2:
    default: {
      transaction.chainId =
        '0x' + (+index_1.bytes2hex(transactionPb.getChainIdV1())).toString(16)
      transaction.to = index_1.bytes2hex(transactionPb.getToV1())
      break
    }
  }
  if (transaction.to && !transaction.to.startsWith('0x')) {
    transaction.to = '0x' + transaction.to
  }
  const sign = new Signature({
    r: index_1.bytes2hex(signature.slice(0, 32)).slice(2),
    s: index_1.bytes2hex(signature.slice(32, 64)).slice(2),
    recoveryParam: signature[64]
  })
  const txMsg = transactionPb.serializeBinary()
  const hashedMsg = index_1.sha3(txMsg).slice(2)
  const msg = new Buffer(hashedMsg.toString(), 'hex')
  const pubPoint = index_1.ec.recoverPubKey(
    msg,
    sign,
    sign.recoveryParam,
    'hex'
  )
  const publicKey = `0x${pubPoint
    .encode('hex')
    .slice(2)
    .toLowerCase()}`
  const bytesPubkey = new Buffer(index_1.hex2bytes(publicKey))
  const address = `0x${index_1
    .sha3(bytesPubkey)
    .slice(-40)
    .toLowerCase()}`
  const hexSig = index_1.bytes2hex(signature).slice(2)
  const result = {
    transaction,
    signature: hexSig,
    sender: { publicKey, address }
  }
  return result
}
exports.default = unsigner
