// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package p2perinik

import (
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = abi.U256
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// P2PerinikABI is the input ABI used to generate the binding from.
const P2PerinikABI = "[{\"constant\":false,\"inputs\":[{\"name\":\"passphrase\",\"type\":\"bytes\"}],\"name\":\"withdraw\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"encryptedAddress\",\"type\":\"bytes\"},{\"name\":\"specialHash\",\"type\":\"bytes32\"}],\"name\":\"deposit\",\"outputs\":[],\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"encryptedAddress\",\"type\":\"bytes\"},{\"name\":\"recipient\",\"type\":\"address\"},{\"name\":\"specialNumber\",\"type\":\"uint8\"}],\"name\":\"generateSpecialHash\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"pure\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"source\",\"type\":\"string\"}],\"name\":\"toBytes\",\"outputs\":[{\"name\":\"b\",\"type\":\"bytes\"}],\"payable\":false,\"stateMutability\":\"pure\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"encryptedAddresses\",\"outputs\":[{\"name\":\"encryptedAddress\",\"type\":\"bytes\"},{\"name\":\"specialHash\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"\",\"type\":\"address\"}],\"name\":\"debug\",\"type\":\"event\"}]"

// P2PerinikBin is the compiled bytecode used for deploying new contracts.
const P2PerinikBin = `0x608060405234801561001057600080fd5b50610f8b806100206000396000f3fe608060405260043610610066577c010000000000000000000000000000000000000000000000000000000060003504630968f264811461006b5780633489c151146101205780633632bce8146101c85780639f2e140e1461029e578063dc19a828146103c6575b600080fd5b34801561007757600080fd5b5061011e6004803603602081101561008e57600080fd5b8101906020810181356401000000008111156100a957600080fd5b8201836020820111156100bb57600080fd5b803590602001918460018302840111640100000000831117156100dd57600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092955061046f945050505050565b005b61011e6004803603604081101561013657600080fd5b81019060208101813564010000000081111561015157600080fd5b82018360208201111561016357600080fd5b8035906020019184600183028401116401000000008311171561018557600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092955050913592506104ca915050565b3480156101d457600080fd5b5061028c600480360360608110156101eb57600080fd5b81019060208101813564010000000081111561020657600080fd5b82018360208201111561021857600080fd5b8035906020019184600183028401116401000000008311171561023a57600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092955050508135600160a060020a03169250506020013560ff166105db565b60408051918252519081900360200190f35b3480156102aa57600080fd5b50610351600480360360208110156102c157600080fd5b8101906020810181356401000000008111156102dc57600080fd5b8201836020820111156102ee57600080fd5b8035906020019184600183028401116401000000008311171561031057600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550610697945050505050565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561038b578181015183820152602001610373565b50505050905090810190601f1680156103b85780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156103d257600080fd5b506103f0600480360360208110156103e957600080fd5b503561069a565b6040518080602001838152602001828103825284818151815260200191508051906020019080838360005b8381101561043357818101518382015260200161041b565b50505050905090810190601f1680156104605780820380516001836020036101000a031916815260200191505b50935050505060405180910390f35b600061047a8261074e565b9050600160a060020a038116156104c657604051600160a060020a03821690600090670de0b6b3a76400009082818181858883f193505050501580156104c4573d6000803e3d6000fd5b505b5050565b6104d38261093a565b156104dd57600080fd5b670de0b6b3a764000034146104f157600080fd5b6104f9610d9d565b5060408051600081830181815260608301909352918152602080820183905282546001810180855593805282518051939493859360029093027f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5630192610563928492910190610db5565b50602091909101516001909101555060008054849190600019810190811061058757fe5b906000526020600020906002020160000190805190602001906105ab929190610db5565b506000805483919060001981019081106105c157fe5b906000526020600020906002020160010181905550505050565b6000838383604051602001808060200184600160a060020a0316600160a060020a031681526020018360ff1660ff168152602001828103825285818151815260200191508051906020019080838360005b8381101561064457818101518382015260200161062c565b50505050905090810190601f1680156106715780820380516001836020036101000a031916815260200191505b509450505050506040516020818303038152906040528051906020012090509392505050565b90565b60008054829081106106a857fe5b60009182526020918290206002918202018054604080516001831615610100026000190190921693909304601f81018590048502820185019093528281529093509183919083018282801561073e5780601f106107135761010080835404028352916020019161073e565b820191906000526020600020905b81548152906001019060200180831161072157829003601f168201915b5050505050908060010154905082565b6000805b60005481101561092f57600061080e60008381548110151561077057fe5b60009182526020918290206002918202018054604080516001831615610100026000190190921693909304601f8101859004850282018501909352828152929091908301828280156108035780601f106107d857610100808354040283529160200191610803565b820191906000526020600020905b8154815290600101906020018083116107e657829003601f168201915b505050505085610988565b9050600160a060020a0381161561092557600160a060020a03811633146108355750610927565b61090760008381548110151561084757fe5b60009182526020918290206002918202018054604080516001831615610100026000190190921693909304601f8101859004850282018501909352828152929091908301828280156108da5780601f106108af576101008083540402835291602001916108da565b820191906000526020600020905b8154815290600101906020018083116108bd57829003601f168201915b505050505085836000868154811015156108f057fe5b906000526020600020906002020160010154610a43565b15156109135750610927565b61091c82610b4f565b91506109359050565b505b600101610752565b50600090505b919050565b6000805b60005481101561092f5761097160008281548110151561095a57fe5b906000526020600020906002020160000184610c19565b15610980576001915050610935565b60010161093e565b6000805b8351811015610a325782818151811015156109a357fe5b90602001015160f860020a900460f860020a0260f860020a900484828151811015156109cb57fe5b90602001015160f860020a900460f860020a0260f860020a90040360f860020a0284828151811015156109fa57fe5b9060200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060010161098c565b50610a3c83610ccf565b9392505050565b6000805b8451811015610b41578286858784815181101515610a6157fe5b90602001015160f860020a900460f860020a0260f860020a9004604051602001808060200184600160a060020a0316600160a060020a031681526020018360ff1660ff168152602001828103825285818151815260200191508051906020019080838360005b83811015610adf578181015183820152602001610ac7565b50505050905090810190601f168015610b0c5780820380516001836020036101000a031916815260200191505b50945050505050604051602081830303815290604052805190602001201415610b39576001915050610b47565b600101610a47565b50600090505b949350505050565b805b60005460001901811015610bcf576000805460018301908110610b7057fe5b9060005260206000209060020201600082815481101515610b8d57fe5b600091825260209091208254600292830290910191610bbe9183918591600019610100600183161502011604610e33565b506001918201549082015501610b51565b50600080546000198101908110610be257fe5b60009182526020822060029091020190610bfc8282610ea8565b5060006001919091018190558054906104c6906000198301610eef565b60008060019050835460026001808316156101000203821604845180821460018114610c485760009450610cc3565b8215610cc3576020831060018114610ca657600189600052602060002060208a018581015b600284828410011415610c9d578151835414610c8c5760009950600093505b600183019250602082019150610c6d565b50505050610cc1565b610100808604029450602088015185141515610cc157600095505b505b50929695505050505050565b600080805b8351811015610d965760008482815181101515610ced57fe5b90602001015160f860020a900460f860020a0260f860020a900460ff16905060308110158015610d1e575060398111155b15610d33576030810383601002019250610d8d565b60418110158015610d455750605a8111155b15610d5a576037810383601002019250610d8d565b60618110158015610d6c5750607a8111155b15610d81576057810383601002019250610d8d565b60009350505050610935565b50600101610cd4565b5092915050565b60408051808201909152606081526000602082015290565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610df657805160ff1916838001178555610e23565b82800160010185558215610e23579182015b82811115610e23578251825591602001919060010190610e08565b50610e2f929150610f1b565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610e6c5780548555610e23565b82800160010185558215610e2357600052602060002091601f016020900482015b82811115610e23578254825591600101919060010190610e8d565b50805460018160011615610100020316600290046000825580601f10610ece5750610eec565b601f016020900490600052602060002090810190610eec9190610f1b565b50565b8154818355818111156104c4576002028160020283600052602060002091820191016104c49190610f35565b61069791905b80821115610e2f5760008155600101610f21565b61069791905b80821115610e2f576000610f4f8282610ea8565b5060006001820155600201610f3b56fea165627a7a72305820d50a7d3416665f5b4e9a18ed701ef8a9a2d4ff18be72b9e53942f8054e76e4130029`

// DeployP2Perinik deploys a new Ethereum contract, binding an instance of P2Perinik to it.
func DeployP2Perinik(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *P2Perinik, error) {
	parsed, err := abi.JSON(strings.NewReader(P2PerinikABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(P2PerinikBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &P2Perinik{P2PerinikCaller: P2PerinikCaller{contract: contract}, P2PerinikTransactor: P2PerinikTransactor{contract: contract}, P2PerinikFilterer: P2PerinikFilterer{contract: contract}}, nil
}

// P2Perinik is an auto generated Go binding around an Ethereum contract.
type P2Perinik struct {
	P2PerinikCaller     // Read-only binding to the contract
	P2PerinikTransactor // Write-only binding to the contract
	P2PerinikFilterer   // Log filterer for contract events
}

// P2PerinikCaller is an auto generated read-only Go binding around an Ethereum contract.
type P2PerinikCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// P2PerinikTransactor is an auto generated write-only Go binding around an Ethereum contract.
type P2PerinikTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// P2PerinikFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type P2PerinikFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// P2PerinikSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type P2PerinikSession struct {
	Contract     *P2Perinik        // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// P2PerinikCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type P2PerinikCallerSession struct {
	Contract *P2PerinikCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts    // Call options to use throughout this session
}

// P2PerinikTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type P2PerinikTransactorSession struct {
	Contract     *P2PerinikTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts    // Transaction auth options to use throughout this session
}

// P2PerinikRaw is an auto generated low-level Go binding around an Ethereum contract.
type P2PerinikRaw struct {
	Contract *P2Perinik // Generic contract binding to access the raw methods on
}

// P2PerinikCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type P2PerinikCallerRaw struct {
	Contract *P2PerinikCaller // Generic read-only contract binding to access the raw methods on
}

// P2PerinikTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type P2PerinikTransactorRaw struct {
	Contract *P2PerinikTransactor // Generic write-only contract binding to access the raw methods on
}

// NewP2Perinik creates a new instance of P2Perinik, bound to a specific deployed contract.
func NewP2Perinik(address common.Address, backend bind.ContractBackend) (*P2Perinik, error) {
	contract, err := bindP2Perinik(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &P2Perinik{P2PerinikCaller: P2PerinikCaller{contract: contract}, P2PerinikTransactor: P2PerinikTransactor{contract: contract}, P2PerinikFilterer: P2PerinikFilterer{contract: contract}}, nil
}

// NewP2PerinikCaller creates a new read-only instance of P2Perinik, bound to a specific deployed contract.
func NewP2PerinikCaller(address common.Address, caller bind.ContractCaller) (*P2PerinikCaller, error) {
	contract, err := bindP2Perinik(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &P2PerinikCaller{contract: contract}, nil
}

// NewP2PerinikTransactor creates a new write-only instance of P2Perinik, bound to a specific deployed contract.
func NewP2PerinikTransactor(address common.Address, transactor bind.ContractTransactor) (*P2PerinikTransactor, error) {
	contract, err := bindP2Perinik(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &P2PerinikTransactor{contract: contract}, nil
}

// NewP2PerinikFilterer creates a new log filterer instance of P2Perinik, bound to a specific deployed contract.
func NewP2PerinikFilterer(address common.Address, filterer bind.ContractFilterer) (*P2PerinikFilterer, error) {
	contract, err := bindP2Perinik(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &P2PerinikFilterer{contract: contract}, nil
}

// bindP2Perinik binds a generic wrapper to an already deployed contract.
func bindP2Perinik(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(P2PerinikABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_P2Perinik *P2PerinikRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _P2Perinik.Contract.P2PerinikCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_P2Perinik *P2PerinikRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _P2Perinik.Contract.P2PerinikTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_P2Perinik *P2PerinikRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _P2Perinik.Contract.P2PerinikTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_P2Perinik *P2PerinikCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _P2Perinik.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_P2Perinik *P2PerinikTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _P2Perinik.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_P2Perinik *P2PerinikTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _P2Perinik.Contract.contract.Transact(opts, method, params...)
}

// EncryptedAddresses is a free data retrieval call binding the contract method 0xdc19a828.
//
// Solidity: function encryptedAddresses( uint256) constant returns(encryptedAddress bytes, specialHash bytes32)
func (_P2Perinik *P2PerinikCaller) EncryptedAddresses(opts *bind.CallOpts, arg0 *big.Int) (struct {
	EncryptedAddress []byte
	SpecialHash      [32]byte
}, error) {
	ret := new(struct {
		EncryptedAddress []byte
		SpecialHash      [32]byte
	})
	out := ret
	err := _P2Perinik.contract.Call(opts, out, "encryptedAddresses", arg0)
	return *ret, err
}

// EncryptedAddresses is a free data retrieval call binding the contract method 0xdc19a828.
//
// Solidity: function encryptedAddresses( uint256) constant returns(encryptedAddress bytes, specialHash bytes32)
func (_P2Perinik *P2PerinikSession) EncryptedAddresses(arg0 *big.Int) (struct {
	EncryptedAddress []byte
	SpecialHash      [32]byte
}, error) {
	return _P2Perinik.Contract.EncryptedAddresses(&_P2Perinik.CallOpts, arg0)
}

// EncryptedAddresses is a free data retrieval call binding the contract method 0xdc19a828.
//
// Solidity: function encryptedAddresses( uint256) constant returns(encryptedAddress bytes, specialHash bytes32)
func (_P2Perinik *P2PerinikCallerSession) EncryptedAddresses(arg0 *big.Int) (struct {
	EncryptedAddress []byte
	SpecialHash      [32]byte
}, error) {
	return _P2Perinik.Contract.EncryptedAddresses(&_P2Perinik.CallOpts, arg0)
}

// GenerateSpecialHash is a free data retrieval call binding the contract method 0x3632bce8.
//
// Solidity: function generateSpecialHash(encryptedAddress bytes, recipient address, specialNumber uint8) constant returns(bytes32)
func (_P2Perinik *P2PerinikCaller) GenerateSpecialHash(opts *bind.CallOpts, encryptedAddress []byte, recipient common.Address, specialNumber uint8) ([32]byte, error) {
	var (
		ret0 = new([32]byte)
	)
	out := ret0
	err := _P2Perinik.contract.Call(opts, out, "generateSpecialHash", encryptedAddress, recipient, specialNumber)
	return *ret0, err
}

// GenerateSpecialHash is a free data retrieval call binding the contract method 0x3632bce8.
//
// Solidity: function generateSpecialHash(encryptedAddress bytes, recipient address, specialNumber uint8) constant returns(bytes32)
func (_P2Perinik *P2PerinikSession) GenerateSpecialHash(encryptedAddress []byte, recipient common.Address, specialNumber uint8) ([32]byte, error) {
	return _P2Perinik.Contract.GenerateSpecialHash(&_P2Perinik.CallOpts, encryptedAddress, recipient, specialNumber)
}

// GenerateSpecialHash is a free data retrieval call binding the contract method 0x3632bce8.
//
// Solidity: function generateSpecialHash(encryptedAddress bytes, recipient address, specialNumber uint8) constant returns(bytes32)
func (_P2Perinik *P2PerinikCallerSession) GenerateSpecialHash(encryptedAddress []byte, recipient common.Address, specialNumber uint8) ([32]byte, error) {
	return _P2Perinik.Contract.GenerateSpecialHash(&_P2Perinik.CallOpts, encryptedAddress, recipient, specialNumber)
}

// ToBytes is a free data retrieval call binding the contract method 0x9f2e140e.
//
// Solidity: function toBytes(source string) constant returns(b bytes)
func (_P2Perinik *P2PerinikCaller) ToBytes(opts *bind.CallOpts, source string) ([]byte, error) {
	var (
		ret0 = new([]byte)
	)
	out := ret0
	err := _P2Perinik.contract.Call(opts, out, "toBytes", source)
	return *ret0, err
}

// ToBytes is a free data retrieval call binding the contract method 0x9f2e140e.
//
// Solidity: function toBytes(source string) constant returns(b bytes)
func (_P2Perinik *P2PerinikSession) ToBytes(source string) ([]byte, error) {
	return _P2Perinik.Contract.ToBytes(&_P2Perinik.CallOpts, source)
}

// ToBytes is a free data retrieval call binding the contract method 0x9f2e140e.
//
// Solidity: function toBytes(source string) constant returns(b bytes)
func (_P2Perinik *P2PerinikCallerSession) ToBytes(source string) ([]byte, error) {
	return _P2Perinik.Contract.ToBytes(&_P2Perinik.CallOpts, source)
}

// Deposit is a paid mutator transaction binding the contract method 0x3489c151.
//
// Solidity: function deposit(encryptedAddress bytes, specialHash bytes32) returns()
func (_P2Perinik *P2PerinikTransactor) Deposit(opts *bind.TransactOpts, encryptedAddress []byte, specialHash [32]byte) (*types.Transaction, error) {
	return _P2Perinik.contract.Transact(opts, "deposit", encryptedAddress, specialHash)
}

// Deposit is a paid mutator transaction binding the contract method 0x3489c151.
//
// Solidity: function deposit(encryptedAddress bytes, specialHash bytes32) returns()
func (_P2Perinik *P2PerinikSession) Deposit(encryptedAddress []byte, specialHash [32]byte) (*types.Transaction, error) {
	return _P2Perinik.Contract.Deposit(&_P2Perinik.TransactOpts, encryptedAddress, specialHash)
}

// Deposit is a paid mutator transaction binding the contract method 0x3489c151.
//
// Solidity: function deposit(encryptedAddress bytes, specialHash bytes32) returns()
func (_P2Perinik *P2PerinikTransactorSession) Deposit(encryptedAddress []byte, specialHash [32]byte) (*types.Transaction, error) {
	return _P2Perinik.Contract.Deposit(&_P2Perinik.TransactOpts, encryptedAddress, specialHash)
}

// Withdraw is a paid mutator transaction binding the contract method 0x0968f264.
//
// Solidity: function withdraw(passphrase bytes) returns()
func (_P2Perinik *P2PerinikTransactor) Withdraw(opts *bind.TransactOpts, passphrase []byte) (*types.Transaction, error) {
	return _P2Perinik.contract.Transact(opts, "withdraw", passphrase)
}

// Withdraw is a paid mutator transaction binding the contract method 0x0968f264.
//
// Solidity: function withdraw(passphrase bytes) returns()
func (_P2Perinik *P2PerinikSession) Withdraw(passphrase []byte) (*types.Transaction, error) {
	return _P2Perinik.Contract.Withdraw(&_P2Perinik.TransactOpts, passphrase)
}

// Withdraw is a paid mutator transaction binding the contract method 0x0968f264.
//
// Solidity: function withdraw(passphrase bytes) returns()
func (_P2Perinik *P2PerinikTransactorSession) Withdraw(passphrase []byte) (*types.Transaction, error) {
	return _P2Perinik.Contract.Withdraw(&_P2Perinik.TransactOpts, passphrase)
}

// P2PerinikDebugIterator is returned from FilterDebug and is used to iterate over the raw logs and unpacked data for Debug events raised by the P2Perinik contract.
type P2PerinikDebugIterator struct {
	Event *P2PerinikDebug // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *P2PerinikDebugIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(P2PerinikDebug)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(P2PerinikDebug)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *P2PerinikDebugIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *P2PerinikDebugIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// P2PerinikDebug represents a Debug event raised by the P2Perinik contract.
type P2PerinikDebug struct {
	common.Address
	Raw types.Log // Blockchain specific contextual infos
}

// FilterDebug is a free log retrieval operation binding the contract event 0x6714a34ec8a9172d2ad9228b7a21a08ff9d784b515a6348762ffc6c67b922ce8.
//
// Solidity: e debug( address)
func (_P2Perinik *P2PerinikFilterer) FilterDebug(opts *bind.FilterOpts) (*P2PerinikDebugIterator, error) {

	logs, sub, err := _P2Perinik.contract.FilterLogs(opts, "debug")
	if err != nil {
		return nil, err
	}
	return &P2PerinikDebugIterator{contract: _P2Perinik.contract, event: "debug", logs: logs, sub: sub}, nil
}

// WatchDebug is a free log subscription operation binding the contract event 0x6714a34ec8a9172d2ad9228b7a21a08ff9d784b515a6348762ffc6c67b922ce8.
//
// Solidity: e debug( address)
func (_P2Perinik *P2PerinikFilterer) WatchDebug(opts *bind.WatchOpts, sink chan<- *P2PerinikDebug) (event.Subscription, error) {

	logs, sub, err := _P2Perinik.contract.WatchLogs(opts, "debug")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(P2PerinikDebug)
				if err := _P2Perinik.contract.UnpackLog(event, "debug", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}
