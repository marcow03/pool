package main

import (
	"flag"
	"io/fs"
	"log"
	"net/http"
	"pool/api"
	"pool/assets"
	"pool/config"
	"pool/internal"
)

func main() {
	address := flag.String("addr", ":8080", "Address to listen on in the form of <address:port>")
	poolDir := flag.String("path", "./pool", "Directory to store pool files")
	debug := flag.Bool("debug", false, "Enable debug mode")
	flag.Parse()

	config := config.Config{
		PoolDir: *poolDir,
		Debug:   *debug,
	}

	err := internal.InitPoolDir(config.PoolDir)
	if err != nil {
		log.Fatalf("Failed to create pool dir: %s", err)
	}

	fileSystem, err := fs.Sub(assets.StaticContentFS, "web")
	if err != nil {
		log.Fatalf("Failed to create sub filesystem: %s", err)
	}

	server := &http.Server{
		Addr:    *address,
		Handler: api.NewRouter(&config, fileSystem),
	}

	if config.Debug {
		log.Printf("Listening on %s and saving pool files to %s", *address, *poolDir)
	}

	server.ListenAndServe()
}
