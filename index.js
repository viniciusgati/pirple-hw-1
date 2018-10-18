const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

//create server
let server = http.createServer((request, response) => {
    //Get the url and parse it
    let parsedUrl = url.parse(request.url);

    //Get the path and remove extra characters
    let path = parsedUrl.path.replace(/^\/+|\/+$/g,'');

    let payload = ''
    request.on('data', (chunk) => {
        payload += decoder.write(chunk);
    });

    request.on('end', () => {
        let chosenHandler
        //call appropirate handler
        console.log('method' , request.method)
        if(request.method == 'POST')
            chosenHandler = (router[path] != undefined) ? router[path] : handlers.notFound;
        else
            chosenHandler = handlers.notAcceptable

        chosenHandler(payload, (status_code, json_response) => {
            let body = JSON.stringify(json_response);
            response.setHeader('content-type','application/json');
            response.writeHead(status_code);
            response.end(body);
        });
    });
});

//start the server
server.listen(3000, (err) => {
    if (! err)
        console.log('Listening on port 3000')
});


// Define handlers
let handlers = {}

//send back sentence,word and character count if user requested /hello
handlers.hello = (payload, callback) => {
    let character_count = payload.length
    // replace dots with empty spaces to count words avoiding sentences like 'hello.And then' to count wrong
    let word_count = payload.replace('.', ' ').split(' ').length
    // remove dots and filter empty sentences to get the total
    let sentence_count = payload.split('.').filter((el)=> el.length != 0).length

    callback(200, {
        character_count: character_count,
        total_words: word_count,
        sentence_count: sentence_count
    });
}

//send not found message if user requested anything else
handlers.notFound = (_, callback) => {
    callback(404,{
        'error': 'not found',
        'error-code': 404,
    });
};

handlers.notAcceptable = (_, callback) => {
    callback(406, {
        'error': 'not acceptable',
        'error-code': 406
    })
}

//define router
let router = {
    'hello': handlers.hello,
};
