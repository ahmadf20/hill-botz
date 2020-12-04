# Hillsbot
Discord bot that's made spesifically for encrypting and decrypting message using hill cipher algorithm

## Usage
 Clone this repo to your local machine 
- Locate to the directory
- Run `$ npm install` to install the required packages into your local machine
- Run `$ node .` in your terminal. Or you may want to run `$ nodemon .` instead for development

## Commands List

To user the bot type the prefix `h.` followed by the commands listed below:
Ex: `h.help`

### Basic Commands

#### `help`
Show the list of available commands   
![Help](./Screenshots/help.png)

#### `ping`
Make a ping request!  
![Ping](./Screenshots/ping.png)

#### `server`
Show the server info

#### `server`
Show the server info   

#### `prune`
Bulk delete messages
Usage : `prune <number of message>`
Example : `h.prune 3` will delete 3 latest messages


### Main Feature

#### `en`
Encrypt message 
Usage : `en [${4 letter of key}] <message>`

Example : 
Using the default key: `h.en CONTOH` 
![Encryption default](./Screenshots/default_encrypt.png)

Using custom key consist of 4 letter: 
`h.en $SATU Lorem Ipsum is ...` 
![Encryption custom](./Screenshots/custom_encrypt.png)

#### `dec`
Decrypt message  
Usage : `dec [${4 letter of key}] <message>`

Example : 
Using the default key: `h.dec CONTOH`  will encrypt the text `CONTOH`
![Decryption default](./Screenshots/default_deccrypt.png)

Using custom key consist of 4 letter: 
```h.dec $SATU u<qW`Fhe:;...``` 
![Decryption custom](./Screenshots/custom_deccrypt.png)


Note:
Paremeter in `[param]` is optional
Parameter in `<param>` is required


## Technology Used
* Node Js
