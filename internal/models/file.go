package models

type File struct {
	Name             string `json:"name"`
	ModificationTime string `json:"modification_time"`
	SizeBytes        int64  `json:"size_bytes"`
}
