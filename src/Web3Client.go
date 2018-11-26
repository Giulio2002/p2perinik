package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"bytes"
	"encoding"
	"encoding/hex"
	"strconv"
	"github.com/tonnerre/golang-go.crypto/sha3"
)


var server = "https://rinkeby.infura.io"

type EthSyncingResponse struct {
	Syncing       bool   `json:"syncing,omitempty"`
	StartingBlock string `json:"startingBlock,omitempty"`
	CurrentBlock  string `json:"currentBlock,omitempty"`
	HighestBlock  string `json:"highestBlock,omitempty"`
}

// I needed a workaround for this
func EthGetTransactionReceipt(txHash string) (*TransactionReceipt, error) {
	resp, err := Call("eth_getTransactionReceipt", []interface{}{txHash})
	if err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, fmt.Errorf(resp.Error.Message)
	}
	answer := new(TransactionReceipt)
	err = MapToObject(resp.Result, answer)
	if err != nil {
		return nil, err
	}
	return answer, nil
}

func (e *EthSyncingResponse) JSONByte() ([]byte, error) {
	return EncodeJSON(e)
}

func (e *EthSyncingResponse) JSONString() (string, error) {
	return EncodeJSONString(e)
}

func (e *EthSyncingResponse) JSONBuffer(b *bytes.Buffer) error {
	return EncodeJSONToBuffer(e, b)
}

func (e *EthSyncingResponse) String() string {
	str, _ := e.JSONString()
	return str
}

type TransactionObject struct {
	Hash             string `json:"hash,omitempty"`
	Nonce            string `json:"nonce,omitempty"`
	BlockHash        string `json:"blockHash,omitempty"`
	BlockNumber      string `json:"blockNumber,omitempty"`
	TransactionIndex string `json:"transactionIndex,omitempty"`

	From     string `json:"from"`
	To       string `json:"to,omitempty"`
	Gas      string `json:"gas,omitempty"`
	GasPrice string `json:"gasPrice,omitempty"`
	Value    string `json:"value,omitempty"`
	Data     string `json:"data,omitempty"`
	Input    string `json:"input,omitempty"`
}

func (e *TransactionObject) JSONByte() ([]byte, error) {
	return EncodeJSON(e)
}

func (e *TransactionObject) JSONString() (string, error) {
	return EncodeJSONString(e)
}

func (e *TransactionObject) JSONBuffer(b *bytes.Buffer) error {
	return EncodeJSONToBuffer(e, b)
}

func (e *TransactionObject) String() string {
	str, _ := e.JSONString()
	return str
}

type BlockObject struct {
	Number           string `json:"number"`
	Hash             string `json:"hash"`
	ParentHash       string `json:"parentHash"`
	Nonce            string `json:"nonce"`
	Sha3Uncles       string `json:"sha3Uncles"`
	LogsBloom        string `json:"logsBloom"`
	TransactionsRoot string `json:"transactionsRoot"`
	StateRoot        string `json:"stateRoot"`
	Miner            string `json:"miner"`
	Difficulty       string `json:"difficulty"`
	TotalDifficulty  string `json:"totalDifficulty"`
	ExtraData        string `json:"extraData"`
	Size             string `json:"size"`
	GasLimit         string `json:"gasLimit"`
	GasUsed          string `json:"gasUsed"`
	Timestamp        string `json:"timestamp"`
	Transactions []interface{} `json:"transactions"`
	Uncles       []string      `json:"uncles"`
}

func (e *BlockObject) JSONByte() ([]byte, error) {
	return EncodeJSON(e)
}

func (e *BlockObject) JSONString() (string, error) {
	return EncodeJSONString(e)
}

func (e *BlockObject) JSONBuffer(b *bytes.Buffer) error {
	return EncodeJSONToBuffer(e, b)
}

func (e *BlockObject) String() string {
	str, _ := e.JSONString()
	return str
}

type TransactionReceipt struct {
	TransactionHash   string        `json:"transactionHash"`
	TransactionIndex  string        `json:"transactionIndex"`
	BlockHash         string        `json:"blockHash"`
	BlockNumber       string        `json:"blockNumber"`
	CumulativeGasUsed string        `json:"cumulativeGasUsed"`
	GasUsed           string        `json:"gasUsed"`
	ContractAddress   string        `json:"contractAddress"`
	Logs              []interface{} `json:"logs"`
}

func (e *TransactionReceipt) JSONByte() ([]byte, error) {
	return EncodeJSON(e)
}

func (e *TransactionReceipt) JSONString() (string, error) {
	return EncodeJSONString(e)
}

func (e *TransactionReceipt) JSONBuffer(b *bytes.Buffer) error {
	return EncodeJSONToBuffer(e, b)
}

func (e *TransactionReceipt) String() string {
	str, _ := e.JSONString()
	return str
}

type FilterOptions struct {
	FromBlock string   `json:"fromBlock,omitempty"`
	ToBlock   string   `json:"toBlock,omitempty"`
	Address   string   `json:"address,omitempty"`
	Topics    []string `json:"topics,omitempty"`
}

func (e *FilterOptions) JSONByte() ([]byte, error) {
	return EncodeJSON(e)
}

func (e *FilterOptions) JSONString() (string, error) {
	return EncodeJSONString(e)
}

func (e *FilterOptions) JSONBuffer(b *bytes.Buffer) error {
	return EncodeJSONToBuffer(e, b)
}

func (e *FilterOptions) String() string {
	str, _ := e.JSONString()
	return str
}

type LogObject struct {
	Type             string   `json:"type"`
	logIndex         string   `json:"logIndex"`
	TransactionIndex string   `json:"transactionIndex"`
	TransactionHash  string   `json:"transactionHash"`
	BlockHash        string   `json:"blockHash"`
	BlockNumber      string   `json:"blockNumber"`
	Address          string   `json:"address"`
	Data             string   `json:"data"`
	Topics           []string `json:"topics"`
}

func (e *LogObject) JSONByte() ([]byte, error) {
	return EncodeJSON(e)
}

func (e *LogObject) JSONString() (string, error) {
	return EncodeJSONString(e)
}

func (e *LogObject) JSONBuffer(b *bytes.Buffer) error {
	return EncodeJSONToBuffer(e, b)
}

func (e *LogObject) String() string {
	str, _ := e.JSONString()
	return str
}

type WhisperMessage struct {
	From     string `json:"from,omitempty"`
	To       string `json:"to,omitempty"`
	Topics   string `json:"topics"`
	Payload  string `json:"payload"`
	Priority string `json:"priority"`
	TTL      string `json:"ttl"`
}

func (e *WhisperMessage) JSONByte() ([]byte, error) {
	return EncodeJSON(e)
}

func (e *WhisperMessage) JSONString() (string, error) {
	return EncodeJSONString(e)
}

func (e *WhisperMessage) JSONBuffer(b *bytes.Buffer) error {
	return EncodeJSONToBuffer(e, b)
}

func (e *WhisperMessage) String() string {
	str, _ := e.JSONString()
	return str
}

type Message struct {
	Hash       string   `json:"hash"`
	From       string   `json:"from"`
	To         string   `json:"to"`
	Expiry     string   `json:"expiry"`
	TTL        string   `json:"ttl"`
	Sent       string   `json:"sent"`
	Topics     []string `json:"topics"`
	Payload    string   `json:"payload"`
	WorkProved string   `json:"workProved"`
}

func (e *Message) JSONByte() ([]byte, error) {
	return EncodeJSON(e)
}

func (e *Message) JSONString() (string, error) {
	return EncodeJSONString(e)
}

func (e *Message) JSONBuffer(b *bytes.Buffer) error {
	return EncodeJSONToBuffer(e, b)
}

func (e *Message) String() string {
	str, _ := e.JSONString()
	return str
}

type Quantity int64

var _ encoding.TextMarshaler = (*Quantity)(nil)
var _ encoding.TextUnmarshaler = (*Quantity)(nil)

func (q *Quantity) MarshalText() (text []byte, err error) {
	return ([]byte)(IntToQuantity(int64(*q))), nil
}

func (q *Quantity) UnmarshalText(text []byte) error {
	i, err := QuantityToInt(string(text))
	if err != nil {
		return err
	}
	*q = Quantity(i)
	return nil
}

func (e *Quantity) JSONByte() ([]byte, error) {
	return EncodeJSON(e)
}

func (e *Quantity) JSONString() (string, error) {
	return EncodeJSONString(e)
}

func (e *Quantity) JSONBuffer(b *bytes.Buffer) error {
	return EncodeJSONToBuffer(e, b)
}

func (e *Quantity) String() string {
	return IntToQuantity(e.Int64())
}

func (q *Quantity) Int64() int64 {
	return int64(*q)
}

func NewQuantityFromInt(i int64) *Quantity {
	q := new(Quantity)
	*q = Quantity(i)
	return q
}

func NewQuantityFromString(s string) *Quantity {
	i, _ := QuantityToInt(s)
	return NewQuantityFromInt(i)
}
// call web3 client
func Call(method string, params interface{}) (*JSON2Response, error) {
	j := NewJSON2RequestBlank()
	j.Method = method
	j.Params = params
	j.ID = 1

	postGet := "POST"

	address := fmt.Sprintf("http://%s/", server)

	data, err := j.JSONString()
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(postGet, address, strings.NewReader(data))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	jResp := new(JSON2Response)

	err = json.Unmarshal(body, jResp)
	if err != nil {
		return nil, err
	}

	return jResp, nil
}

func MapToObject(source interface{}, dst interface{}) error {
	b, err := json.Marshal(source)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, dst)
}

func ParseQuantity(q string) (int64, error) {
	return strconv.ParseInt(q, 0, 64)
}

func EncodeJSON(data interface{}) ([]byte, error) {
	encoded, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	return encoded, nil
}

func EncodeJSONString(data interface{}) (string, error) {
	encoded, err := EncodeJSON(data)
	if err != nil {
		return "", err
	}
	return string(encoded), err
}

func EncodeJSONToBuffer(data interface{}, b *bytes.Buffer) error {
	encoded, err := EncodeJSON(data)
	if err != nil {
		return err
	}
	_, err = b.Write(encoded)
	return err
}

type JSON2Request struct {
	JSONRPC string      `json:"jsonrpc"`
	ID      interface{} `json:"id"`
	Params  interface{} `json:"params,omitempty"`
	Method  string      `json:"method,omitempty"`
}

func (e *JSON2Request) JSONByte() ([]byte, error) {
	return EncodeJSON(e)
}

func (e *JSON2Request) JSONString() (string, error) {
	return EncodeJSONString(e)
}

func (e *JSON2Request) JSONBuffer(b *bytes.Buffer) error {
	return EncodeJSONToBuffer(e, b)
}

func (e *JSON2Request) String() string {
	str, _ := e.JSONString()
	return str
}

func NewJSON2RequestBlank() *JSON2Request {
	j := new(JSON2Request)
	j.JSONRPC = "2.0"
	return j
}

func NewJSON2Request(id, params interface{}, method string) *JSON2Request {
	j := new(JSON2Request)
	j.JSONRPC = "2.0"
	j.ID = id
	j.Params = params
	j.Method = method
	return j
}

func ParseJSON2Request(request string) (*JSON2Request, error) {
	j := new(JSON2Request)
	err := json.Unmarshal([]byte(request), j)
	if err != nil {
		return nil, err
	}
	if j.JSONRPC != "2.0" {
		return nil, fmt.Errorf("Invalid JSON RPC version - `%v`, should be `2.0`", j.JSONRPC)
	}
	return j, nil
}

type JSON2Response struct {
	JSONRPC string      `json:"jsonrpc"`
	ID      interface{} `json:"id"`
	Error   *JSONError  `json:"error,omitempty"`
	Result  interface{} `json:"result,omitempty"`
}

func (e *JSON2Response) JSONByte() ([]byte, error) {
	return EncodeJSON(e)
}

func (e *JSON2Response) JSONString() (string, error) {
	return EncodeJSONString(e)
}

func (e *JSON2Response) JSONBuffer(b *bytes.Buffer) error {
	return EncodeJSONToBuffer(e, b)
}

func (e *JSON2Response) String() string {
	str, _ := e.JSONString()
	return str
}

func NewJSON2Response() *JSON2Response {
	j := new(JSON2Response)
	j.JSONRPC = "2.0"
	return j
}

func (j *JSON2Response) AddError(code int, message string, data interface{}) {
	e := NewJSONError(code, message, data)
	j.Error = e
}

type JSONError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func NewJSONError(code int, message string, data interface{}) *JSONError {
	j := new(JSONError)
	j.Code = code
	j.Message = message
	j.Data = data
	return j
}

func IntToQuantity(i int64) string {
	return "0x" + IntToQuantityWithoutPrefix(i)
}

func IntToQuantityWithoutPrefix(i int64) string {
	hex := fmt.Sprintf("%x", i)
	index := -1
	for i := range hex {
		if hex[i] == byte('0') {
			index = i
		} else {
			break
		}
	}
	if index > -1 {
		hex = hex[index:]
	}
	if len(hex) == 0 {
		hex = "0"
	}
	return hex
}

func QuantityToInt(q string) (int64, error) {
	if len(q) > 1 {
		if q[0] == '0' && q[1] == 'x' {
			q = q[2:]
		}
	}

	if len(q)%2 == 1 {
		q = "0" + q
	}

	return strconv.ParseInt(q, 16, 64)
}

func HexToData(b []byte) string {
	return "0x" + HexToDataWithoutPrefix(b)
}

func HexToDataWithoutPrefix(b []byte) string {
	return fmt.Sprintf("%x", b)
}

func HexToPaddedData(b []byte) string {
	return "0x" + HexToDataWithoutPrefix(b)
}

func HexToPaddedDataWithoutPrefix(b []byte) string {
	l := len(b)
	data := IntToData(int64(l))
	data += fmt.Sprintf("%x", b)
	if l%32 != 0 {
		rest := make([]byte, 32-l%32)
		data += fmt.Sprintf("%x", rest)
	}
	return data
}

func DataToHex(data string) ([]byte, error) {
	if len(data) > 1 {
		if data[0] == '0' && data[1] == 'x' {
			data = data[2:]
		}
	}
	return hex.DecodeString(data)
}

func StringToMethodID(method string) string {
	h := sha3.NewKeccak256()
	h.Write([]byte(method))
	var digest [32]byte
	h.Sum(digest[:0])
	return fmt.Sprintf("%x", digest[:4])
}

func IntToData(i int64) string {
	return fmt.Sprintf("%064x", i)
}

func StringToData(str string) string {
	return HexToPaddedData([]byte(str))
}

func StringToDataWithoutPrefix(str string) string {
	return HexToPaddedDataWithoutPrefix([]byte(str))
}
