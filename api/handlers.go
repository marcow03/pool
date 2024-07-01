package api

import (
	"fmt"
	"io"
	"net/http"
	"pool/assets"
	"pool/config"
	"pool/internal"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type Handler struct {
	Config *config.Config
}

func (h Handler) HelpHandler(w http.ResponseWriter, r *http.Request) {
	var content = strings.ReplaceAll(assets.HelpFile, "<pool-url>", internal.GetRequestPath(r))

	render.PlainText(w, r, content)
}

func (h Handler) GetPoolCtlHandler(w http.ResponseWriter, r *http.Request) {
	var content = strings.ReplaceAll(assets.PoolCtlFile, "<pool-url>", internal.GetRequestPath(r))

	render.PlainText(w, r, content)
}

func (h Handler) ListHandler(w http.ResponseWriter, r *http.Request) {
	pattern := chi.URLParam(r, "pattern")
	files := internal.GetPoolFiles(h.Config.PoolDir, pattern)

	render.JSON(w, r, files)
}

func (h Handler) GetHandler(w http.ResponseWriter, r *http.Request) {
	file := chi.URLParam(r, "file")
	content := internal.GetPoolFileContent(h.Config.PoolDir, file)

	render.PlainText(w, r, string(content))
}

func (h Handler) PullHandler(w http.ResponseWriter, r *http.Request) {
	file := chi.URLParam(r, "file")
	content, filename, err := internal.PullPoolFiles(h.Config.PoolDir, file)
	if err != nil {
		render.Status(r, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	render.Data(w, r, []byte(content))
}

func (h Handler) RemoveHandler(w http.ResponseWriter, r *http.Request) {
	file := chi.URLParam(r, "file")
	internal.RemovePoolFile(h.Config.PoolDir, file)

	render.Status(r, http.StatusNoContent)
}

func (h Handler) UploadHandler(w http.ResponseWriter, r *http.Request) {
	// Parse all files up to 5GB from the request
	err := r.ParseMultipartForm(5 << 30)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		return
	}

	for _, files := range r.MultipartForm.File {
		for _, fileHeader := range files {
			file, err := fileHeader.Open()
			if err != nil {
				render.Status(r, http.StatusBadRequest)
				return
			}
			defer file.Close()

			content, err := io.ReadAll(file)
			if err != nil {
				render.Status(r, http.StatusInternalServerError)
				return
			}

			err = internal.SavePoolFile(h.Config.PoolDir, fileHeader.Filename, content)
			if err != nil {
				render.Status(r, http.StatusInternalServerError)
				return
			}
		}
	}

	render.Status(r, http.StatusCreated)
}
