// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package miximus

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

// MiximusABI is the input ABI used to generate the binding from.
const MiximusABI = "[{\"constant\":false,\"inputs\":[{\"name\":\"x\",\"type\":\"bytes32\"}],\"name\":\"padZero\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"j\",\"type\":\"uint256\"},{\"name\":\"k\",\"type\":\"uint256\"}],\"name\":\"getLeaf\",\"outputs\":[{\"name\":\"root\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"a\",\"type\":\"bytes32\"}],\"name\":\"reverse\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"pure\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"leaf\",\"type\":\"bytes32\"},{\"name\":\"depth\",\"type\":\"uint256\"}],\"name\":\"getUniqueLeaf\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"MT\",\"outputs\":[{\"name\":\"cur\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"serials\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"getRoot\",\"outputs\":[{\"name\":\"root\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"source\",\"type\":\"bytes32\"}],\"name\":\"nullifierToAddress\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"zksnark_verify\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"input\",\"type\":\"bytes32\"},{\"name\":\"sk\",\"type\":\"bytes32\"}],\"name\":\"getSha256\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"getMerkelProof\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes32[29]\"},{\"name\":\"\",\"type\":\"uint256[29]\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"no_leaves\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"input\",\"type\":\"uint256\"}],\"name\":\"pad3bit\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"roots\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"leaf\",\"type\":\"bytes32\"}],\"name\":\"deposit\",\"outputs\":[],\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"root\",\"type\":\"bytes32\"}],\"name\":\"isRoot\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"left\",\"type\":\"uint256\"},{\"name\":\"right\",\"type\":\"uint256\"}],\"name\":\"merge253bitWords\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"a\",\"type\":\"uint256[2]\"},{\"name\":\"a_p\",\"type\":\"uint256[2]\"},{\"name\":\"b\",\"type\":\"uint256[2][2]\"},{\"name\":\"b_p\",\"type\":\"uint256[2]\"},{\"name\":\"c\",\"type\":\"uint256[2]\"},{\"name\":\"c_p\",\"type\":\"uint256[2]\"},{\"name\":\"h\",\"type\":\"uint256[2]\"},{\"name\":\"k\",\"type\":\"uint256[2]\"},{\"name\":\"input\",\"type\":\"uint256[]\"}],\"name\":\"withdraw\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"tree_depth\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"x\",\"type\":\"bytes32\"}],\"name\":\"getZero\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"a\",\"type\":\"uint256\"}],\"name\":\"reverseByte\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"_zksnark_verify\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"\",\"type\":\"address\"}],\"name\":\"Withdraw\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"leafAdded\",\"type\":\"event\"}]"

// MiximusBin is the compiled bytecode used for deploying new contracts.
const MiximusBin = `6080604052601d600255632000000060035534801561001d57600080fd5b506040516020806118a383398101806040528101908080519060200190929190505050806403c000000760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505061180e806100956000396000f30060806040526004361061011d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630a152dd8146101225780632fb2798d1461016f57806337b34974146101c25780633dac9b2a1461020f5780634a1f11a7146102665780634e475ef0146102915780635ca1e165146102da5780635ccd52831461030d5780635d0a66041461037e5780638f49f9e7146103d55780639ad1ee9d14610430578063a03515fd146104c8578063a333e901146104f3578063ae6dead714610534578063b214faa51461057d578063caadea17146105a1578063d5bd8e8e146105ea578063d7cbcfc51461063d578063e08dfff814610893578063e1f0d6ba146108be578063f08383061461090b575b600080fd5b34801561012e57600080fd5b50610151600480360381019080803560001916906020019092919050505061094c565b60405180826000191660001916815260200191505060405180910390f35b34801561017b57600080fd5b506101a4600480360381019080803590602001909291908035906020019092919050505061097b565b60405180826000191660001916815260200191505060405180910390f35b3480156101ce57600080fd5b506101f160048036038101908080356000191690602001909291905050506109b0565b60405180826000191660001916815260200191505060405180910390f35b34801561021b57600080fd5b50610248600480360381019080803560001916906020019092919080359060200190929190505050610a0f565b60405180826000191660001916815260200191505060405180910390f35b34801561027257600080fd5b5061027b610ab6565b6040518082815260200191505060405180910390f35b34801561029d57600080fd5b506102c06004803603810190808035600019169060200190929190505050610ac2565b604051808215151515815260200191505060405180910390f35b3480156102e657600080fd5b506102ef610ae2565b60405180826000191660001916815260200191505060405180910390f35b34801561031957600080fd5b5061033c6004803603810190808035600019169060200190929190505050610b17565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561038a57600080fd5b50610393610bba565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b3480156103e157600080fd5b5061041260048036038101908080356000191690602001909291908035600019169060200190929190505050610be4565b60405180826000191660001916815260200191505060405180910390f35b34801561043c57600080fd5b5061045b60048036038101908080359060200190929190505050610c5b565b6040518083601d60200280838360005b8381101561048657808201518184015260208101905061046b565b5050505090500182601d60200280838360005b838110156104b4578082015181840152602081019050610499565b505050509050019250505060405180910390f35b3480156104d457600080fd5b506104dd610da4565b6040518082815260200191505060405180910390f35b3480156104ff57600080fd5b5061051e60048036038101908080359060200190929190505050610daa565b6040518082815260200191505060405180910390f35b34801561054057600080fd5b506105636004803603810190808035600019169060200190929190505050610dfc565b604051808215151515815260200191505060405180910390f35b61059f6004803603810190808035600019169060200190929190505050610e1c565b005b3480156105ad57600080fd5b506105d06004803603810190808035600019169060200190929190505050610e86565b604051808215151515815260200191505060405180910390f35b3480156105f657600080fd5b5061061f6004803603810190808035906020019092919080359060200190929190505050610ebc565b60405180826000191660001916815260200191505060405180910390f35b34801561064957600080fd5b50610851600480360381019080806040019060028060200260405190810160405280929190826002602002808284378201915050505050919291929080604001906002806020026040519081016040528092919082600260200280828437820191505050505091929192908060800190600280602002604051908101604052809291906000905b828210156107125783826040020160028060200260405190810160405280929190826002602002808284378201915050505050815260200190600101906106d0565b5050505091929192908060400190600280602002604051908101604052809291908260026020028082843782019150505050509192919290806040019060028060200260405190810160405280929190826002602002808284378201915050505050919291929080604001906002806020026040519081016040528092919082600260200280828437820191505050505091929192908060400190600280602002604051908101604052809291908260026020028082843782019150505050509192919290806040019060028060200260405190810160405280929190826002602002808284378201915050505050919291929080359060200190820180359060200190808060200260200160405190810160405280939291908181526020018383602002808284378201915050505050509192919290505050610f1a565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561089f57600080fd5b506108a861145f565b6040518082815260200191505060405180910390f35b3480156108ca57600080fd5b506108ed6004803603810190808035600019169060200190929190505050611465565b60405180826000191660001916815260200191505060405180910390f35b34801561091757600080fd5b5061093660048036038101908080359060200190929190505050611475565b6040518082815260200191505060405180910390f35b60007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff060010282169050919050565b6000600460010183601e8110151561098f57fe5b63200000000201826320000000811015156109a657fe5b0154905092915050565b600080600080600091505b6020821015610a015760ff600883601f030286600190049060020a90041690506109e481611475565b905060088202819060020a028301925081806001019250506109bb565b826001029350505050919050565b600080600060010284600019161415610aac57600090505b82811015610aab57600284856040518083600019166000191681526020018260001916600019168152602001925050506020604051808303816000865af1158015610a76573d6000803e3d6000fd5b5050506040513d6020811015610a8b57600080fd5b810190808051906020019092919050505093508080600101915050610a27565b5b8391505092915050565b60048060000154905081565b60006020528060005260406000206000915054906101000a900460ff1681565b60006004600101600254601e81101515610af857fe5b632000000002016000632000000081101515610b1057fe5b0154905090565b6000610b21611778565b604080519081016040528060006c01000000000000000000000000026bffffffffffffffffffffffff19166bffffffffffffffffffffffff1916815260200160006c01000000000000000000000000026bffffffffffffffffffffffff19168152509050828152826014820152806000600281101515610b9d57fe5b60200201516c010000000000000000000000009004915050919050565b6403c000000760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600283836040518083600019166000191681526020018260001916600019168152602001925050506020604051808303816000865af1158015610c2d573d6000803e3d6000fd5b5050506040513d6020811015610c4257600080fd5b8101908080519060200190929190505050905092915050565b610c6361179a565b610c6b6117be565b610c736117be565b610c7b61179a565b60008090505b600254811015610d9657600286811515610c9757fe5b068382601d81101515610ca657fe5b6020020181815250506000600287811515610cbd57fe5b061415610d2157610cfb600460010182601e81101515610cd957fe5b6320000000020160018801632000000081101515610cf357fe5b015482610a0f565b8282601d81101515610d0957fe5b60200201906000191690816000191681525050610d7a565b610d58600460010182601e81101515610d3657fe5b6320000000020160018803632000000081101515610d5057fe5b015482610a0f565b8282601d81101515610d6657fe5b602002019060001916908160001916815250505b600286811515610d8657fe5b0495508080600101915050610c81565b818394509450505050915091565b60035481565b600080821415610dbd5760009050610df7565b6001821415610dcf5760049050610df7565b6002821415610de15760049050610df7565b6003821415610df35760069050610df7565b8190505b919050565b60016020528060005260406000206000915054906101000a900460ff1681565b670de0b6b3a764000034141515610e3257600080fd5b610e3b816114c1565b5060016403c00000056000610e56610e51610ae2565b61094c565b6000191660001916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b60006403c00000056000836000191660001916815260200190815260200160002060009054906101000a900460ff169050919050565b600080600080610ecb85610daa565b9450610ee1610edc876001026109b0565b61094c565b600190049250610efb610ef6876001026109b0565b611465565b6001900491508185019450848301905080600102935050505092915050565b6000806000806000610f4e610f49876002815181101515610f3757fe5b906020019060200201516001026109b0565b610b17565b9350610f7c610f77876000815181101515610f6557fe5b906020019060200201516001026109b0565b61094c565b9250610faa610fa5876002815181101515610f9357fe5b906020019060200201516001026109b0565b61094c565b91506403c00000056000846000191660001916815260200190815260200160002060009054906101000a900460ff161515610fe457600080fd5b6403c00000066000836000191660001916815260200190815260200160002060009054906101000a900460ff1615151561101d57600080fd5b6403c000000760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663c8e6ba4d8f8f8f8f8f8f8f8f8f6040518a63ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808a600260200280838360005b838110156110be5780820151818401526020810190506110a3565b5050505090500189600260200280838360005b838110156110ec5780820151818401526020810190506110d1565b505050509050018860026000925b818410156111405782846020020151600260200280838360005b8381101561112f578082015181840152602081019050611114565b5050505090500192600101926110fa565b9250505087600260200280838360005b8381101561116b578082015181840152602081019050611150565b5050505090500186600260200280838360005b8381101561119957808201518184015260208101905061117e565b5050505090500185600260200280838360005b838110156111c75780820151818401526020810190506111ac565b5050505090500184600260200280838360005b838110156111f55780820151818401526020810190506111da565b5050505090500183600260200280838360005b83811015611223578082015181840152602081019050611208565b5050505090500180602001828103825283818151815260200191508051906020019060200280838360005b8381101561126957808201518184015260208101905061124e565b505050509050019a5050505050505050505050602060405180830381600087803b15801561129657600080fd5b505af11580156112aa573d6000803e3d6000fd5b505050506040513d60208110156112c057600080fd5b810190808051906020019092919050505015156112dc57600080fd5b60016403c00000066000846000191660001916815260200190815260200160002060006101000a81548160ff02191690831515021790555085600481518110151561132357fe5b906020019060200201519050670de0b6b3a76400008110151561134557600080fd5b600081141515611397573373ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f19350505050158015611395573d6000803e3d6000fd5b505b8373ffffffffffffffffffffffffffffffffffffffff166108fc82670de0b6b3a7640000039081150290604051600060405180830381858888f193505050501580156113e7573d6000803e3d6000fd5b507ff67611512e0a2d90c96fd3f08dca4971bc45fba9dc679eabe839a32abbe58a8e84604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1839450505050509998505050505050505050565b60025481565b6000600f60010282169050919050565b6000806ff070b030d0509010e060a020c04080009050600f60046008600f6004879060020a9004160201829060020a90041660f06008600f861602839060020a90041601915050919050565b6000600160035403600460000154141515156114dc57600080fd5b8160046001016000601e811015156114f057fe5b6320000000020160046000015463200000008110151561150c57fe5b01816000191690555061151d611578565b507f80275d0ddfbdefbc062585e28de92e22caf9c6b92c42d2521b52ad401ebe12cb6004600001546040518082815260200191505060405180910390a160046000016000815480929190600101919050555060019050919050565b6000806000806000806004600001549450600091505b600254821015611740576002858115156115a457fe5b04905060006002868115156115b557fe5b06141561162757600460010182601e811015156115ce57fe5b63200000000201856320000000811015156115e557fe5b01549350611620600460010183601e811015156115fe57fe5b632000000002016001870163200000008110151561161857fe5b015483610a0f565b925061168e565b61165e600460010183601e8110151561163c57fe5b632000000002016001870363200000008110151561165657fe5b015483610a0f565b9350600460010182601e8110151561167257fe5b632000000002018563200000008110151561168957fe5b015492505b600284846040518083600019166000191681526020018260001916600019168152602001925050506020604051808303816000865af11580156116d5573d6000803e3d6000fd5b5050506040513d60208110156116ea57600080fd5b8101908080519060200190929190505050600460010160018401601e8110151561171057fe5b632000000002018263200000008110151561172757fe5b018160001916905550809450818060010192505061158e565b6004600101600254601e8110151561175457fe5b63200000000201600063200000008110151561176c57fe5b01549550505050505090565b6040805190810160405280600290602082028038833980820191505090505090565b6103a060405190810160405280601d90602082028038833980820191505090505090565b6103a060405190810160405280601d906020820280388339808201915050905050905600a165627a7a723058201cf8c0b384f5bc232c5742e62c081e032e8af42b214788c8840a1f9944999f840029`

// DeployMiximus deploys a new Ethereum contract, binding an instance of Miximus to it.
func DeployMiximus(auth *bind.TransactOpts, backend bind.ContractBackend, _zksnark_verify common.Address) (common.Address, *types.Transaction, *Miximus, error) {
	parsed, err := abi.JSON(strings.NewReader(MiximusABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(MiximusBin), backend, _zksnark_verify)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &Miximus{MiximusCaller: MiximusCaller{contract: contract}, MiximusTransactor: MiximusTransactor{contract: contract}, MiximusFilterer: MiximusFilterer{contract: contract}}, nil
}

// Miximus is an auto generated Go binding around an Ethereum contract.
type Miximus struct {
	MiximusCaller     // Read-only binding to the contract
	MiximusTransactor // Write-only binding to the contract
	MiximusFilterer   // Log filterer for contract events
}

// MiximusCaller is an auto generated read-only Go binding around an Ethereum contract.
type MiximusCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// MiximusTransactor is an auto generated write-only Go binding around an Ethereum contract.
type MiximusTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// MiximusFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type MiximusFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// MiximusSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type MiximusSession struct {
	Contract     *Miximus          // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// MiximusCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type MiximusCallerSession struct {
	Contract *MiximusCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts  // Call options to use throughout this session
}

// MiximusTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type MiximusTransactorSession struct {
	Contract     *MiximusTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts  // Transaction auth options to use throughout this session
}

// MiximusRaw is an auto generated low-level Go binding around an Ethereum contract.
type MiximusRaw struct {
	Contract *Miximus // Generic contract binding to access the raw methods on
}

// MiximusCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type MiximusCallerRaw struct {
	Contract *MiximusCaller // Generic read-only contract binding to access the raw methods on
}

// MiximusTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type MiximusTransactorRaw struct {
	Contract *MiximusTransactor // Generic write-only contract binding to access the raw methods on
}

// NewMiximus creates a new instance of Miximus, bound to a specific deployed contract.
func NewMiximus(address common.Address, backend bind.ContractBackend) (*Miximus, error) {
	contract, err := bindMiximus(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Miximus{MiximusCaller: MiximusCaller{contract: contract}, MiximusTransactor: MiximusTransactor{contract: contract}, MiximusFilterer: MiximusFilterer{contract: contract}}, nil
}

// NewMiximusCaller creates a new read-only instance of Miximus, bound to a specific deployed contract.
func NewMiximusCaller(address common.Address, caller bind.ContractCaller) (*MiximusCaller, error) {
	contract, err := bindMiximus(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &MiximusCaller{contract: contract}, nil
}

// NewMiximusTransactor creates a new write-only instance of Miximus, bound to a specific deployed contract.
func NewMiximusTransactor(address common.Address, transactor bind.ContractTransactor) (*MiximusTransactor, error) {
	contract, err := bindMiximus(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &MiximusTransactor{contract: contract}, nil
}

// NewMiximusFilterer creates a new log filterer instance of Miximus, bound to a specific deployed contract.
func NewMiximusFilterer(address common.Address, filterer bind.ContractFilterer) (*MiximusFilterer, error) {
	contract, err := bindMiximus(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &MiximusFilterer{contract: contract}, nil
}

// bindMiximus binds a generic wrapper to an already deployed contract.
func bindMiximus(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(MiximusABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Miximus *MiximusRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Miximus.Contract.MiximusCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Miximus *MiximusRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Miximus.Contract.MiximusTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Miximus *MiximusRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Miximus.Contract.MiximusTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Miximus *MiximusCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Miximus.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Miximus *MiximusTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Miximus.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Miximus *MiximusTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Miximus.Contract.contract.Transact(opts, method, params...)
}

// MT is a free data retrieval call binding the contract method 0x4a1f11a7.
//
// Solidity: function MT() constant returns(cur uint256)
func (_Miximus *MiximusCaller) MT(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "MT")
	return *ret0, err
}

// MT is a free data retrieval call binding the contract method 0x4a1f11a7.
//
// Solidity: function MT() constant returns(cur uint256)
func (_Miximus *MiximusSession) MT() (*big.Int, error) {
	return _Miximus.Contract.MT(&_Miximus.CallOpts)
}

// MT is a free data retrieval call binding the contract method 0x4a1f11a7.
//
// Solidity: function MT() constant returns(cur uint256)
func (_Miximus *MiximusCallerSession) MT() (*big.Int, error) {
	return _Miximus.Contract.MT(&_Miximus.CallOpts)
}

// GetLeaf is a free data retrieval call binding the contract method 0x2fb2798d.
//
// Solidity: function getLeaf(j uint256, k uint256) constant returns(root bytes32)
func (_Miximus *MiximusCaller) GetLeaf(opts *bind.CallOpts, j *big.Int, k *big.Int) ([32]byte, error) {
	var (
		ret0 = new([32]byte)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "getLeaf", j, k)
	return *ret0, err
}

// GetLeaf is a free data retrieval call binding the contract method 0x2fb2798d.
//
// Solidity: function getLeaf(j uint256, k uint256) constant returns(root bytes32)
func (_Miximus *MiximusSession) GetLeaf(j *big.Int, k *big.Int) ([32]byte, error) {
	return _Miximus.Contract.GetLeaf(&_Miximus.CallOpts, j, k)
}

// GetLeaf is a free data retrieval call binding the contract method 0x2fb2798d.
//
// Solidity: function getLeaf(j uint256, k uint256) constant returns(root bytes32)
func (_Miximus *MiximusCallerSession) GetLeaf(j *big.Int, k *big.Int) ([32]byte, error) {
	return _Miximus.Contract.GetLeaf(&_Miximus.CallOpts, j, k)
}

// GetMerkelProof is a free data retrieval call binding the contract method 0x9ad1ee9d.
//
// Solidity: function getMerkelProof(index uint256) constant returns(bytes32[29], uint256[29])
func (_Miximus *MiximusCaller) GetMerkelProof(opts *bind.CallOpts, index *big.Int) ([29][32]byte, [29]*big.Int, error) {
	var (
		ret0 = new([29][32]byte)
		ret1 = new([29]*big.Int)
	)
	out := &[]interface{}{
		ret0,
		ret1,
	}
	err := _Miximus.contract.Call(opts, out, "getMerkelProof", index)
	return *ret0, *ret1, err
}

// GetMerkelProof is a free data retrieval call binding the contract method 0x9ad1ee9d.
//
// Solidity: function getMerkelProof(index uint256) constant returns(bytes32[29], uint256[29])
func (_Miximus *MiximusSession) GetMerkelProof(index *big.Int) ([29][32]byte, [29]*big.Int, error) {
	return _Miximus.Contract.GetMerkelProof(&_Miximus.CallOpts, index)
}

// GetMerkelProof is a free data retrieval call binding the contract method 0x9ad1ee9d.
//
// Solidity: function getMerkelProof(index uint256) constant returns(bytes32[29], uint256[29])
func (_Miximus *MiximusCallerSession) GetMerkelProof(index *big.Int) ([29][32]byte, [29]*big.Int, error) {
	return _Miximus.Contract.GetMerkelProof(&_Miximus.CallOpts, index)
}

// GetRoot is a free data retrieval call binding the contract method 0x5ca1e165.
//
// Solidity: function getRoot() constant returns(root bytes32)
func (_Miximus *MiximusCaller) GetRoot(opts *bind.CallOpts) ([32]byte, error) {
	var (
		ret0 = new([32]byte)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "getRoot")
	return *ret0, err
}

// GetRoot is a free data retrieval call binding the contract method 0x5ca1e165.
//
// Solidity: function getRoot() constant returns(root bytes32)
func (_Miximus *MiximusSession) GetRoot() ([32]byte, error) {
	return _Miximus.Contract.GetRoot(&_Miximus.CallOpts)
}

// GetRoot is a free data retrieval call binding the contract method 0x5ca1e165.
//
// Solidity: function getRoot() constant returns(root bytes32)
func (_Miximus *MiximusCallerSession) GetRoot() ([32]byte, error) {
	return _Miximus.Contract.GetRoot(&_Miximus.CallOpts)
}

// GetSha256 is a free data retrieval call binding the contract method 0x8f49f9e7.
//
// Solidity: function getSha256(input bytes32, sk bytes32) constant returns(bytes32)
func (_Miximus *MiximusCaller) GetSha256(opts *bind.CallOpts, input [32]byte, sk [32]byte) ([32]byte, error) {
	var (
		ret0 = new([32]byte)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "getSha256", input, sk)
	return *ret0, err
}

// GetSha256 is a free data retrieval call binding the contract method 0x8f49f9e7.
//
// Solidity: function getSha256(input bytes32, sk bytes32) constant returns(bytes32)
func (_Miximus *MiximusSession) GetSha256(input [32]byte, sk [32]byte) ([32]byte, error) {
	return _Miximus.Contract.GetSha256(&_Miximus.CallOpts, input, sk)
}

// GetSha256 is a free data retrieval call binding the contract method 0x8f49f9e7.
//
// Solidity: function getSha256(input bytes32, sk bytes32) constant returns(bytes32)
func (_Miximus *MiximusCallerSession) GetSha256(input [32]byte, sk [32]byte) ([32]byte, error) {
	return _Miximus.Contract.GetSha256(&_Miximus.CallOpts, input, sk)
}

// IsRoot is a free data retrieval call binding the contract method 0xcaadea17.
//
// Solidity: function isRoot(root bytes32) constant returns(bool)
func (_Miximus *MiximusCaller) IsRoot(opts *bind.CallOpts, root [32]byte) (bool, error) {
	var (
		ret0 = new(bool)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "isRoot", root)
	return *ret0, err
}

// IsRoot is a free data retrieval call binding the contract method 0xcaadea17.
//
// Solidity: function isRoot(root bytes32) constant returns(bool)
func (_Miximus *MiximusSession) IsRoot(root [32]byte) (bool, error) {
	return _Miximus.Contract.IsRoot(&_Miximus.CallOpts, root)
}

// IsRoot is a free data retrieval call binding the contract method 0xcaadea17.
//
// Solidity: function isRoot(root bytes32) constant returns(bool)
func (_Miximus *MiximusCallerSession) IsRoot(root [32]byte) (bool, error) {
	return _Miximus.Contract.IsRoot(&_Miximus.CallOpts, root)
}

// NoLeaves is a free data retrieval call binding the contract method 0xa03515fd.
//
// Solidity: function no_leaves() constant returns(uint256)
func (_Miximus *MiximusCaller) NoLeaves(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "no_leaves")
	return *ret0, err
}

// NoLeaves is a free data retrieval call binding the contract method 0xa03515fd.
//
// Solidity: function no_leaves() constant returns(uint256)
func (_Miximus *MiximusSession) NoLeaves() (*big.Int, error) {
	return _Miximus.Contract.NoLeaves(&_Miximus.CallOpts)
}

// NoLeaves is a free data retrieval call binding the contract method 0xa03515fd.
//
// Solidity: function no_leaves() constant returns(uint256)
func (_Miximus *MiximusCallerSession) NoLeaves() (*big.Int, error) {
	return _Miximus.Contract.NoLeaves(&_Miximus.CallOpts)
}

// Pad3bit is a free data retrieval call binding the contract method 0xa333e901.
//
// Solidity: function pad3bit(input uint256) constant returns(uint256)
func (_Miximus *MiximusCaller) Pad3bit(opts *bind.CallOpts, input *big.Int) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "pad3bit", input)
	return *ret0, err
}

// Pad3bit is a free data retrieval call binding the contract method 0xa333e901.
//
// Solidity: function pad3bit(input uint256) constant returns(uint256)
func (_Miximus *MiximusSession) Pad3bit(input *big.Int) (*big.Int, error) {
	return _Miximus.Contract.Pad3bit(&_Miximus.CallOpts, input)
}

// Pad3bit is a free data retrieval call binding the contract method 0xa333e901.
//
// Solidity: function pad3bit(input uint256) constant returns(uint256)
func (_Miximus *MiximusCallerSession) Pad3bit(input *big.Int) (*big.Int, error) {
	return _Miximus.Contract.Pad3bit(&_Miximus.CallOpts, input)
}

// Reverse is a free data retrieval call binding the contract method 0x37b34974.
//
// Solidity: function reverse(a bytes32) constant returns(bytes32)
func (_Miximus *MiximusCaller) Reverse(opts *bind.CallOpts, a [32]byte) ([32]byte, error) {
	var (
		ret0 = new([32]byte)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "reverse", a)
	return *ret0, err
}

// Reverse is a free data retrieval call binding the contract method 0x37b34974.
//
// Solidity: function reverse(a bytes32) constant returns(bytes32)
func (_Miximus *MiximusSession) Reverse(a [32]byte) ([32]byte, error) {
	return _Miximus.Contract.Reverse(&_Miximus.CallOpts, a)
}

// Reverse is a free data retrieval call binding the contract method 0x37b34974.
//
// Solidity: function reverse(a bytes32) constant returns(bytes32)
func (_Miximus *MiximusCallerSession) Reverse(a [32]byte) ([32]byte, error) {
	return _Miximus.Contract.Reverse(&_Miximus.CallOpts, a)
}

// ReverseByte is a free data retrieval call binding the contract method 0xf0838306.
//
// Solidity: function reverseByte(a uint256) constant returns(uint256)
func (_Miximus *MiximusCaller) ReverseByte(opts *bind.CallOpts, a *big.Int) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "reverseByte", a)
	return *ret0, err
}

// ReverseByte is a free data retrieval call binding the contract method 0xf0838306.
//
// Solidity: function reverseByte(a uint256) constant returns(uint256)
func (_Miximus *MiximusSession) ReverseByte(a *big.Int) (*big.Int, error) {
	return _Miximus.Contract.ReverseByte(&_Miximus.CallOpts, a)
}

// ReverseByte is a free data retrieval call binding the contract method 0xf0838306.
//
// Solidity: function reverseByte(a uint256) constant returns(uint256)
func (_Miximus *MiximusCallerSession) ReverseByte(a *big.Int) (*big.Int, error) {
	return _Miximus.Contract.ReverseByte(&_Miximus.CallOpts, a)
}

// Roots is a free data retrieval call binding the contract method 0xae6dead7.
//
// Solidity: function roots( bytes32) constant returns(bool)
func (_Miximus *MiximusCaller) Roots(opts *bind.CallOpts, arg0 [32]byte) (bool, error) {
	var (
		ret0 = new(bool)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "roots", arg0)
	return *ret0, err
}

// Roots is a free data retrieval call binding the contract method 0xae6dead7.
//
// Solidity: function roots( bytes32) constant returns(bool)
func (_Miximus *MiximusSession) Roots(arg0 [32]byte) (bool, error) {
	return _Miximus.Contract.Roots(&_Miximus.CallOpts, arg0)
}

// Roots is a free data retrieval call binding the contract method 0xae6dead7.
//
// Solidity: function roots( bytes32) constant returns(bool)
func (_Miximus *MiximusCallerSession) Roots(arg0 [32]byte) (bool, error) {
	return _Miximus.Contract.Roots(&_Miximus.CallOpts, arg0)
}

// Serials is a free data retrieval call binding the contract method 0x4e475ef0.
//
// Solidity: function serials( bytes32) constant returns(bool)
func (_Miximus *MiximusCaller) Serials(opts *bind.CallOpts, arg0 [32]byte) (bool, error) {
	var (
		ret0 = new(bool)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "serials", arg0)
	return *ret0, err
}

// Serials is a free data retrieval call binding the contract method 0x4e475ef0.
//
// Solidity: function serials( bytes32) constant returns(bool)
func (_Miximus *MiximusSession) Serials(arg0 [32]byte) (bool, error) {
	return _Miximus.Contract.Serials(&_Miximus.CallOpts, arg0)
}

// Serials is a free data retrieval call binding the contract method 0x4e475ef0.
//
// Solidity: function serials( bytes32) constant returns(bool)
func (_Miximus *MiximusCallerSession) Serials(arg0 [32]byte) (bool, error) {
	return _Miximus.Contract.Serials(&_Miximus.CallOpts, arg0)
}

// TreeDepth is a free data retrieval call binding the contract method 0xe08dfff8.
//
// Solidity: function tree_depth() constant returns(uint256)
func (_Miximus *MiximusCaller) TreeDepth(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "tree_depth")
	return *ret0, err
}

// TreeDepth is a free data retrieval call binding the contract method 0xe08dfff8.
//
// Solidity: function tree_depth() constant returns(uint256)
func (_Miximus *MiximusSession) TreeDepth() (*big.Int, error) {
	return _Miximus.Contract.TreeDepth(&_Miximus.CallOpts)
}

// TreeDepth is a free data retrieval call binding the contract method 0xe08dfff8.
//
// Solidity: function tree_depth() constant returns(uint256)
func (_Miximus *MiximusCallerSession) TreeDepth() (*big.Int, error) {
	return _Miximus.Contract.TreeDepth(&_Miximus.CallOpts)
}

// ZksnarkVerify is a free data retrieval call binding the contract method 0x5d0a6604.
//
// Solidity: function zksnark_verify() constant returns(address)
func (_Miximus *MiximusCaller) ZksnarkVerify(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _Miximus.contract.Call(opts, out, "zksnark_verify")
	return *ret0, err
}

// ZksnarkVerify is a free data retrieval call binding the contract method 0x5d0a6604.
//
// Solidity: function zksnark_verify() constant returns(address)
func (_Miximus *MiximusSession) ZksnarkVerify() (common.Address, error) {
	return _Miximus.Contract.ZksnarkVerify(&_Miximus.CallOpts)
}

// ZksnarkVerify is a free data retrieval call binding the contract method 0x5d0a6604.
//
// Solidity: function zksnark_verify() constant returns(address)
func (_Miximus *MiximusCallerSession) ZksnarkVerify() (common.Address, error) {
	return _Miximus.Contract.ZksnarkVerify(&_Miximus.CallOpts)
}

// Deposit is a paid mutator transaction binding the contract method 0xb214faa5.
//
// Solidity: function deposit(leaf bytes32) returns()
func (_Miximus *MiximusTransactor) Deposit(opts *bind.TransactOpts, leaf [32]byte) (*types.Transaction, error) {
	return _Miximus.contract.Transact(opts, "deposit", leaf)
}

// Deposit is a paid mutator transaction binding the contract method 0xb214faa5.
//
// Solidity: function deposit(leaf bytes32) returns()
func (_Miximus *MiximusSession) Deposit(leaf [32]byte) (*types.Transaction, error) {
	return _Miximus.Contract.Deposit(&_Miximus.TransactOpts, leaf)
}

// Deposit is a paid mutator transaction binding the contract method 0xb214faa5.
//
// Solidity: function deposit(leaf bytes32) returns()
func (_Miximus *MiximusTransactorSession) Deposit(leaf [32]byte) (*types.Transaction, error) {
	return _Miximus.Contract.Deposit(&_Miximus.TransactOpts, leaf)
}

// GetUniqueLeaf is a paid mutator transaction binding the contract method 0x3dac9b2a.
//
// Solidity: function getUniqueLeaf(leaf bytes32, depth uint256) returns(bytes32)
func (_Miximus *MiximusTransactor) GetUniqueLeaf(opts *bind.TransactOpts, leaf [32]byte, depth *big.Int) (*types.Transaction, error) {
	return _Miximus.contract.Transact(opts, "getUniqueLeaf", leaf, depth)
}

// GetUniqueLeaf is a paid mutator transaction binding the contract method 0x3dac9b2a.
//
// Solidity: function getUniqueLeaf(leaf bytes32, depth uint256) returns(bytes32)
func (_Miximus *MiximusSession) GetUniqueLeaf(leaf [32]byte, depth *big.Int) (*types.Transaction, error) {
	return _Miximus.Contract.GetUniqueLeaf(&_Miximus.TransactOpts, leaf, depth)
}

// GetUniqueLeaf is a paid mutator transaction binding the contract method 0x3dac9b2a.
//
// Solidity: function getUniqueLeaf(leaf bytes32, depth uint256) returns(bytes32)
func (_Miximus *MiximusTransactorSession) GetUniqueLeaf(leaf [32]byte, depth *big.Int) (*types.Transaction, error) {
	return _Miximus.Contract.GetUniqueLeaf(&_Miximus.TransactOpts, leaf, depth)
}

// GetZero is a paid mutator transaction binding the contract method 0xe1f0d6ba.
//
// Solidity: function getZero(x bytes32) returns(bytes32)
func (_Miximus *MiximusTransactor) GetZero(opts *bind.TransactOpts, x [32]byte) (*types.Transaction, error) {
	return _Miximus.contract.Transact(opts, "getZero", x)
}

// GetZero is a paid mutator transaction binding the contract method 0xe1f0d6ba.
//
// Solidity: function getZero(x bytes32) returns(bytes32)
func (_Miximus *MiximusSession) GetZero(x [32]byte) (*types.Transaction, error) {
	return _Miximus.Contract.GetZero(&_Miximus.TransactOpts, x)
}

// GetZero is a paid mutator transaction binding the contract method 0xe1f0d6ba.
//
// Solidity: function getZero(x bytes32) returns(bytes32)
func (_Miximus *MiximusTransactorSession) GetZero(x [32]byte) (*types.Transaction, error) {
	return _Miximus.Contract.GetZero(&_Miximus.TransactOpts, x)
}

// Merge253bitWords is a paid mutator transaction binding the contract method 0xd5bd8e8e.
//
// Solidity: function merge253bitWords(left uint256, right uint256) returns(bytes32)
func (_Miximus *MiximusTransactor) Merge253bitWords(opts *bind.TransactOpts, left *big.Int, right *big.Int) (*types.Transaction, error) {
	return _Miximus.contract.Transact(opts, "merge253bitWords", left, right)
}

// Merge253bitWords is a paid mutator transaction binding the contract method 0xd5bd8e8e.
//
// Solidity: function merge253bitWords(left uint256, right uint256) returns(bytes32)
func (_Miximus *MiximusSession) Merge253bitWords(left *big.Int, right *big.Int) (*types.Transaction, error) {
	return _Miximus.Contract.Merge253bitWords(&_Miximus.TransactOpts, left, right)
}

// Merge253bitWords is a paid mutator transaction binding the contract method 0xd5bd8e8e.
//
// Solidity: function merge253bitWords(left uint256, right uint256) returns(bytes32)
func (_Miximus *MiximusTransactorSession) Merge253bitWords(left *big.Int, right *big.Int) (*types.Transaction, error) {
	return _Miximus.Contract.Merge253bitWords(&_Miximus.TransactOpts, left, right)
}

// NullifierToAddress is a paid mutator transaction binding the contract method 0x5ccd5283.
//
// Solidity: function nullifierToAddress(source bytes32) returns(address)
func (_Miximus *MiximusTransactor) NullifierToAddress(opts *bind.TransactOpts, source [32]byte) (*types.Transaction, error) {
	return _Miximus.contract.Transact(opts, "nullifierToAddress", source)
}

// NullifierToAddress is a paid mutator transaction binding the contract method 0x5ccd5283.
//
// Solidity: function nullifierToAddress(source bytes32) returns(address)
func (_Miximus *MiximusSession) NullifierToAddress(source [32]byte) (*types.Transaction, error) {
	return _Miximus.Contract.NullifierToAddress(&_Miximus.TransactOpts, source)
}

// NullifierToAddress is a paid mutator transaction binding the contract method 0x5ccd5283.
//
// Solidity: function nullifierToAddress(source bytes32) returns(address)
func (_Miximus *MiximusTransactorSession) NullifierToAddress(source [32]byte) (*types.Transaction, error) {
	return _Miximus.Contract.NullifierToAddress(&_Miximus.TransactOpts, source)
}

// PadZero is a paid mutator transaction binding the contract method 0x0a152dd8.
//
// Solidity: function padZero(x bytes32) returns(bytes32)
func (_Miximus *MiximusTransactor) PadZero(opts *bind.TransactOpts, x [32]byte) (*types.Transaction, error) {
	return _Miximus.contract.Transact(opts, "padZero", x)
}

// PadZero is a paid mutator transaction binding the contract method 0x0a152dd8.
//
// Solidity: function padZero(x bytes32) returns(bytes32)
func (_Miximus *MiximusSession) PadZero(x [32]byte) (*types.Transaction, error) {
	return _Miximus.Contract.PadZero(&_Miximus.TransactOpts, x)
}

// PadZero is a paid mutator transaction binding the contract method 0x0a152dd8.
//
// Solidity: function padZero(x bytes32) returns(bytes32)
func (_Miximus *MiximusTransactorSession) PadZero(x [32]byte) (*types.Transaction, error) {
	return _Miximus.Contract.PadZero(&_Miximus.TransactOpts, x)
}

// Withdraw is a paid mutator transaction binding the contract method 0xd7cbcfc5.
//
// Solidity: function withdraw(a uint256[2], a_p uint256[2], b uint256[2][2], b_p uint256[2], c uint256[2], c_p uint256[2], h uint256[2], k uint256[2], input uint256[]) returns(address)
func (_Miximus *MiximusTransactor) Withdraw(opts *bind.TransactOpts, a [2]*big.Int, a_p [2]*big.Int, b [2][2]*big.Int, b_p [2]*big.Int, c [2]*big.Int, c_p [2]*big.Int, h [2]*big.Int, k [2]*big.Int, input []*big.Int) (*types.Transaction, error) {
	return _Miximus.contract.Transact(opts, "withdraw", a, a_p, b, b_p, c, c_p, h, k, input)
}

// Withdraw is a paid mutator transaction binding the contract method 0xd7cbcfc5.
//
// Solidity: function withdraw(a uint256[2], a_p uint256[2], b uint256[2][2], b_p uint256[2], c uint256[2], c_p uint256[2], h uint256[2], k uint256[2], input uint256[]) returns(address)
func (_Miximus *MiximusSession) Withdraw(a [2]*big.Int, a_p [2]*big.Int, b [2][2]*big.Int, b_p [2]*big.Int, c [2]*big.Int, c_p [2]*big.Int, h [2]*big.Int, k [2]*big.Int, input []*big.Int) (*types.Transaction, error) {
	return _Miximus.Contract.Withdraw(&_Miximus.TransactOpts, a, a_p, b, b_p, c, c_p, h, k, input)
}

// Withdraw is a paid mutator transaction binding the contract method 0xd7cbcfc5.
//
// Solidity: function withdraw(a uint256[2], a_p uint256[2], b uint256[2][2], b_p uint256[2], c uint256[2], c_p uint256[2], h uint256[2], k uint256[2], input uint256[]) returns(address)
func (_Miximus *MiximusTransactorSession) Withdraw(a [2]*big.Int, a_p [2]*big.Int, b [2][2]*big.Int, b_p [2]*big.Int, c [2]*big.Int, c_p [2]*big.Int, h [2]*big.Int, k [2]*big.Int, input []*big.Int) (*types.Transaction, error) {
	return _Miximus.Contract.Withdraw(&_Miximus.TransactOpts, a, a_p, b, b_p, c, c_p, h, k, input)
}

// MiximusWithdrawIterator is returned from FilterWithdraw and is used to iterate over the raw logs and unpacked data for Withdraw events raised by the Miximus contract.
type MiximusWithdrawIterator struct {
	Event *MiximusWithdraw // Event containing the contract specifics and raw log

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
func (it *MiximusWithdrawIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(MiximusWithdraw)
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
		it.Event = new(MiximusWithdraw)
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
func (it *MiximusWithdrawIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *MiximusWithdrawIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// MiximusWithdraw represents a Withdraw event raised by the Miximus contract.
type MiximusWithdraw struct {
	common.Address
	Raw types.Log // Blockchain specific contextual infos
}

// FilterWithdraw is a free log retrieval operation binding the contract event 0xf67611512e0a2d90c96fd3f08dca4971bc45fba9dc679eabe839a32abbe58a8e.
//
// Solidity: e Withdraw( address)
func (_Miximus *MiximusFilterer) FilterWithdraw(opts *bind.FilterOpts) (*MiximusWithdrawIterator, error) {

	logs, sub, err := _Miximus.contract.FilterLogs(opts, "Withdraw")
	if err != nil {
		return nil, err
	}
	return &MiximusWithdrawIterator{contract: _Miximus.contract, event: "Withdraw", logs: logs, sub: sub}, nil
}

// WatchWithdraw is a free log subscription operation binding the contract event 0xf67611512e0a2d90c96fd3f08dca4971bc45fba9dc679eabe839a32abbe58a8e.
//
// Solidity: e Withdraw( address)
func (_Miximus *MiximusFilterer) WatchWithdraw(opts *bind.WatchOpts, sink chan<- *MiximusWithdraw) (event.Subscription, error) {

	logs, sub, err := _Miximus.contract.WatchLogs(opts, "Withdraw")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(MiximusWithdraw)
				if err := _Miximus.contract.UnpackLog(event, "Withdraw", log); err != nil {
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

// MiximusLeafAddedIterator is returned from FilterLeafAdded and is used to iterate over the raw logs and unpacked data for LeafAdded events raised by the Miximus contract.
type MiximusLeafAddedIterator struct {
	Event *MiximusLeafAdded // Event containing the contract specifics and raw log

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
func (it *MiximusLeafAddedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(MiximusLeafAdded)
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
		it.Event = new(MiximusLeafAdded)
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
func (it *MiximusLeafAddedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *MiximusLeafAddedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// MiximusLeafAdded represents a LeafAdded event raised by the Miximus contract.
type MiximusLeafAdded struct {
	Index *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterLeafAdded is a free log retrieval operation binding the contract event 0x80275d0ddfbdefbc062585e28de92e22caf9c6b92c42d2521b52ad401ebe12cb.
//
// Solidity: e leafAdded(index uint256)
func (_Miximus *MiximusFilterer) FilterLeafAdded(opts *bind.FilterOpts) (*MiximusLeafAddedIterator, error) {

	logs, sub, err := _Miximus.contract.FilterLogs(opts, "leafAdded")
	if err != nil {
		return nil, err
	}
	return &MiximusLeafAddedIterator{contract: _Miximus.contract, event: "leafAdded", logs: logs, sub: sub}, nil
}

// WatchLeafAdded is a free log subscription operation binding the contract event 0x80275d0ddfbdefbc062585e28de92e22caf9c6b92c42d2521b52ad401ebe12cb.
//
// Solidity: e leafAdded(index uint256)
func (_Miximus *MiximusFilterer) WatchLeafAdded(opts *bind.WatchOpts, sink chan<- *MiximusLeafAdded) (event.Subscription, error) {

	logs, sub, err := _Miximus.contract.WatchLogs(opts, "leafAdded")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(MiximusLeafAdded)
				if err := _Miximus.contract.UnpackLog(event, "leafAdded", log); err != nil {
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
