from web3 import *
from web3.contract import ConciseContract
import ctypes as c
from solc import compile_source, compile_files, link_code
import random

w3 = Web3(HTTPProvider("http://localhost:8545"));
lib = c.cdll.LoadLibrary('../libperinik/libperinik.so')

deploy_gas = 0
deposit_table = []
withdraw_table = []
keys = []

def compile():
    contract = "../contracts/p2perinik.sol"
    compiled_sol =  compile_files([contract])
    interface = compiled_sol[contract + ':P2Perinik']
    return interface

def deploy():
    interface  = compile()

     # Instantiate and deploy contract
    p2perinik = w3.eth.contract(abi=interface['abi'], bytecode=interface['bin'])
    tx_hash = p2perinik.deploy(transaction={'from': w3.eth.accounts[0], 'gas': 4000000}, args=[])

    # Get tx receipt to get contract address
    tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash, 10000)
    address = tx_receipt['contractAddress']
    global deploy_gas
    deploy_gas = tx_receipt['gasUsed']
    # Contract instance in concise mode
    abi = interface['abi']
    p2perinik = w3.eth.contract(address=address, abi=abi, ContractFactoryClass=ConciseContract)
    return(p2perinik)

def genKey(address):
    key = [random.choice("0123456789abcdef0123456789ABCDEF") for x in range(0,len(address))]
    special = random.choice(key)
    out = "".join(key)
    return out, special

def deposit(contract):
    global keys
    global deposit_table
    recipient = w3.eth.accounts[1]
    key, special = genKey(w3.eth.accounts[1])
    lib.P2PERINIK_Encrypt.restype = c.c_char_p
    lib.P2PERINIK_Encrypt.argtypes = [c.c_char_p, c.c_char_p]
    encrypted = lib.P2PERINIK_Encrypt(recipient.encode('utf-8'), key.encode('utf-8'))
    specialHash = contract.generateSpecialHash(encrypted, w3.eth.accounts[1], ord(special))
    keys.append(key)
    tx_hash = contract.deposit( encrypted, specialHash, transact={'from': w3.eth.accounts[0], 'gas': 4000000, "value":w3.toWei(1, "ether")})
    tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash, 10000)
    deposit_table.append(tx_receipt["gasUsed"])

def withdraw(contract, key):
    global withdraw_table
    tx_hash = contract.withdraw( key.encode('utf-8'), transact={'from': w3.eth.accounts[0], 'gas': 4000000})
    tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash, 10000)
    withdraw_table.append(tx_receipt["gasUsed"])

def calc_withdraw(contract):
	global keys
	for k in reversed(keys):
		withdraw(contract, k)

def calc_dep(contract):
    for x in range(1,50):
    	deposit(contract)

def main():
    print("Deploying...")
    contract = deploy()
    print("Calculating gas used for deposit...")
    calc_dep(contract)
    print("Calculating gas used for withdraw...")
    calc_withdraw(contract)
    print("========== Result Table ==========")   
    print("Deploy Cost: " + str(deploy_gas) + " Gas") 
    print("Deposit Costs:")
    for idx, d in enumerate(deposit_table):
         print ("	Deposit[" + str(idx) + "]: " + str(d))
    print("Withdraw Costs:")
    for idx, w in enumerate(withdraw_table):
         print ("	Withdraw[" + str(idx) + "]: " + str(w))

if __name__ == '__main__':
    main()
