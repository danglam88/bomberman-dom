package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"
)

const RESPONSE_OK = "ok"
const RESPONSE_ERR = "error"

type handlerFunction func(w http.ResponseWriter, r *http.Request)

type Handler struct {
	Endpoint     string
	Method       string
	GetFunction  handlerFunction
	PostFunction handlerFunction
}

type Response struct {
	Status string `json:"status"`
	Error  string `json:"error"`
}

func Start(collection []Handler) {

	mux := http.NewServeMux()

	for _, handler := range collection {
		mux.Handle(handler.Endpoint, GetFunc(handler))
	}

	miniframework := http.FileServer(http.Dir("../frontend/mini_framework"))
	mux.Handle("/mini_framework/", http.StripPrefix("/mini_framework", miniframework))

	htmlFs := http.FileServer(http.Dir("../frontend/html"))
	mux.Handle("/", http.StripPrefix("/", htmlFs))

	jsFs := http.FileServer(http.Dir("../frontend/js"))
	mux.Handle("/js/", http.StripPrefix("/js", jsFs))

	cssFs := http.FileServer(http.Dir("../frontend/css"))
	mux.Handle("/css/", http.StripPrefix("/css", cssFs))

	imgFs := http.FileServer(http.Dir("../frontend/img"))
	mux.Handle("/img/", http.StripPrefix("/img", imgFs))

	soundFs := http.FileServer(http.Dir("../frontend/sound"))
	mux.Handle("/sound/", http.StripPrefix("/sound", soundFs))

	manager := NewManager()
	mux.HandleFunc("/ws/", manager.serveWS)

	limitedMux := Limit(mux)

	// Setting timeout, idle timeout, and read timeout
	server := &http.Server{
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  20 * time.Second,
		Addr:         ":8080",
		Handler:      limitedMux,
	}

	log.Println("Server is listening on port 8080")
	log.Fatal(server.ListenAndServe())
}

func GetFunc(handler Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		enableCors(&w, r)

		if r.Method == "OPTIONS" {
			return
		}

		if r.Method == "GET" && handler.GetFunction != nil {
			handler.GetFunction(w, r)
		} else if r.Method == "POST" && handler.PostFunction != nil {
			handler.PostFunction(w, r)
		} else {
			http.NotFound(w, r)
			return
		}
	}
}

func GetErrResponse(w http.ResponseWriter, errorMess string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	response := Response{Status: RESPONSE_ERR, Error: errorMess}
	res, err := json.Marshal(response)
	if err != nil {
		log.Fatal(err)
	}
	io.WriteString(w, string(res))
}

// for development mod only, should be deleted after
func enableCors(w *http.ResponseWriter, r *http.Request) {

	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

	if r.Method == "OPTIONS" {
		(*w).WriteHeader(http.StatusOK)
		return
	}
}
