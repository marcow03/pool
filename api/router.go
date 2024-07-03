package api

import (
	"io/fs"
	"net/http"
	"pool/config"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/render"
)

func NewRouter(config *config.Config, staticContentFS fs.FS) *chi.Mux {
	handlers := Handlers{Config: config}

	r := chi.NewRouter()

	if config.Debug {
		r.Use(middleware.Logger)
	}
	r.Use(render.SetContentType(render.ContentTypeJSON))

	r.Handle("/*", http.FileServer(http.FS(staticContentFS)))
	r.Get("/help", handlers.HelpHandler)
	r.Get("/poolctl", handlers.GetPoolCtlHandler)
	r.Route("/ls", func(r chi.Router) {
		r.Get("/", handlers.ListHandler)
		r.Get("/{pattern}", handlers.ListHandler)
	})
	r.Get("/cat/{file}", handlers.GetHandler)
	r.Get("/pull/{file}", handlers.PullHandler)
	r.Get("/rm/{file}", handlers.RemoveHandler)
	r.Post("/push", handlers.UploadHandler)

	return r
}
