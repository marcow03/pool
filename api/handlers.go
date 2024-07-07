package api

import (
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/marcow03/pool/assets"
	"github.com/marcow03/pool/config"
	"github.com/marcow03/pool/internal"
	"github.com/mileusna/useragent"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type Handlers struct {
	Config *config.Config
}

func (h Handlers) HelpHandler(w http.ResponseWriter, r *http.Request) {
	var content = strings.ReplaceAll(assets.HelpFile, "<pool-url>", internal.GetRequestPath(r))

	render.PlainText(w, r, content)
}

func (h Handlers) GetPoolCtlHandler(w http.ResponseWriter, r *http.Request) {
	var plattform = r.URL.Query().Get("plattform")
	var agent = useragent.Parse(r.UserAgent())

	// Not very useful, just for consistency
	// If no plattform is given and the user agent is known, redirect to the plattform
	// So that the user sees how the url scheme works in the browser
	// And can use the same url when curl'ing in the command line
	if plattform == "" && !agent.IsUnknown() {
		http.Redirect(w, r, fmt.Sprintf("%s?plattform=%s", r.RequestURI, strings.ToLower(agent.OS)), http.StatusSeeOther)
		return
	}

	var content string
	if plattform == "windows" || agent.IsWindows() {
		content = strings.ReplaceAll(assets.PoolCtlFileWin, "<pool-url>", internal.GetRequestPath(r))
	} else {
		content = strings.ReplaceAll(assets.PoolCtlFile, "<pool-url>", internal.GetRequestPath(r))
	}

	render.PlainText(w, r, content)
}

func (h Handlers) ListHandler(w http.ResponseWriter, r *http.Request) {
	pattern := chi.URLParam(r, "pattern")
	files := internal.GetPoolFiles(h.Config.PoolDir, pattern)

	render.JSON(w, r, files)
}

func (h Handlers) GetHandler(w http.ResponseWriter, r *http.Request) {
	file := chi.URLParam(r, "file")
	content := internal.GetPoolFileContent(h.Config.PoolDir, file)

	render.PlainText(w, r, string(content))
}

func (h Handlers) PullHandler(w http.ResponseWriter, r *http.Request) {
	file := chi.URLParam(r, "file")
	content, filename, err := internal.PullPoolFiles(h.Config.PoolDir, file)
	if err != nil {
		render.Status(r, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	render.Data(w, r, []byte(content))
}

func (h Handlers) RemoveHandler(w http.ResponseWriter, r *http.Request) {
	file := chi.URLParam(r, "file")
	internal.RemovePoolFile(h.Config.PoolDir, file)

	render.Status(r, http.StatusNoContent)
}

func (h Handlers) UploadHandler(w http.ResponseWriter, r *http.Request) {
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
