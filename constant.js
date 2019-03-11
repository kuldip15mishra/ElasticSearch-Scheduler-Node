exports.IndexName = "metasearchv16";
exports.Isfetching =false;
exports.URL={
  signalsURL :"https://api.signal.ddriven.in:1111/trender/signals",
  id:"UTR",
  AUTHENTICATE:"https://api.entitlement.ddriven.in:3773/entitlement/api/security-manager/authenticate",
}
exports.Index={
  "settings": {
    "index": {
      "analysis": {
        "filter": {
          "keyword_analyzer": {
            "type": "nGram",
            "min_gram": 1,
            "max_gram": 20,
            "token_chars": [
               "letter",
               "digit",
               "punctuation"
             
            ]
          }
      },
        "analyzer": {
          "keyword_analyzer": {
            "filter": [
              "lowercase",
              "asciifolding",
              "keyword_analyzer"
            ],
            
            "type": "custom",
            "tokenizer": "keyword"
          },
          "edge_ngram_analyzer": {
            "filter": [
              "lowercase"
            ],
            "tokenizer": "edge_ngram_tokenizer"
          },
          "edge_ngram_search_analyzer": {
            "tokenizer": "lowercase"
          }
        },
        "tokenizer": {
          "edge_ngram_tokenizer": {
            "type": "ngram",
            "min_gram": 1,
            "max_gram": 20,
            "token_chars": [
              "letter",
              "digit",
              "punctuation"
            ]
          }
        }
      }
    }
  },
  "mappings": {
    "signals": {
      "properties": {
        "tagName": {
          "type": "text",
          "fields": {
            "keywordstring": {
              "type": "text",
              "analyzer": "keyword_analyzer"
            },
            "edgengram": {
              "type": "text",
              "analyzer": "edge_ngram_analyzer",
              "search_analyzer": "edge_ngram_search_analyzer"
            },
            "completion": {
              "type": "completion"
            }
          },
          "analyzer": "standard"
        }
      }
    }
  }
}
// exports.Index={
//     "settings": {
//         "analysis": {
//           "analyzer": {
//             "my_analyzer": {
//               "tokenizer": "my_tokenizer"
//             }
//           },
//           "tokenizer": {
//             "my_tokenizer": {
//               "type": "ngram",
//               "min_gram": 1,
//               "max_gram": 30,
//               "token_chars": [
//                 "letter",
//                 "digit"
//               ]
//             }
//           }
//         }
//       },
    
//         "mapping" : {
          
//           "tagName": {
//             "type": "string",
//             "fields": {
//               "ngram": {
//                 "type": "string",
//                 "analyzer" : "my_analyzer"
//               }
//             }
//           }
//         }
      
//   }