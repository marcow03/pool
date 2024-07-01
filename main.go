package main

import (
	"embed"
	"flag"
	"io/fs"
	"log"
	"net/http"
	"pool/config"
	"pool/internal"
)

//go:embed web/*
var staticContent embed.FS

func main() {
	address := flag.String("addr", ":8080", "Address to listen on in the form of <address:port>")
	poolDir := flag.String("path", "./pool", "Directory to store pool files")
	flag.Parse()

	config := config.Config{
		PoolDir: *poolDir,
	}

	err := internal.InitPoolDir(config.PoolDir)
	if err != nil {
		log.Fatalf("Failed to create pool dir: %s", err)
	}

	fileSystem, err := fs.Sub(staticContent, "web")
	if err != nil {
		log.Fatalf("Failed to create sub filesystem: %s", err)
	}

	server := &http.Server{
		Addr:    *address,
		Handler: NewRouter(&config, fileSystem),
	}

	server.ListenAndServe()
}
