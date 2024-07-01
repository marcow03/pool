package internal

import (
	"archive/zip"
	"fmt"
	"os"
	"path/filepath"
	"pool/internal/models"
	"strings"
)

func InitPoolDir(path string) error {
	return os.MkdirAll(path, os.ModePerm)
}

func GetPoolFiles(path string, filter string) []models.File {
	dir, err := os.Open(path)
	if err != nil {
		return []models.File{}
	}
	defer dir.Close()

	dirEntry, _ := dir.ReadDir(0)

	files := make([]models.File, 0, len(dirEntry))
	for _, entry := range dirEntry {
		info, err := entry.Info()
		if err != nil {
			continue
		}

		if filter != "" {
			if strings.Contains(info.Name(), filter) {
				files = append(files, models.File{
					Name:             entry.Name(),
					ModificationTime: info.ModTime().Format("2006-01-02 15:04:05"),
					SizeBytes:        info.Size(),
				})
			}
		} else {
			files = append(files, models.File{
				Name:             entry.Name(),
				ModificationTime: info.ModTime().Format("2006-01-02 15:04:05"),
				SizeBytes:        info.Size(),
			})
		}
	}

	return files
}

func GetPoolFileContent(path string, file string) []byte {
	content, err := os.ReadFile(filepath.Join(path, file))
	if err != nil {
		content = make([]byte, 0)
	}

	return content
}

func PullPoolFiles(path string, pattern string) ([]byte, string, error) {
	matches := GetPoolFiles(path, pattern)

	if len(matches) > 1 {
		// Create a zip archive.
		zipFile, err := os.Create(filepath.Join(path, fmt.Sprintf("%s.zip", pattern)))
		if err != nil {
			return nil, "", err
		}
		defer zipFile.Close()
		defer os.Remove(zipFile.Name())

		zipWriter := zip.NewWriter(zipFile)

		for _, match := range matches {
			file, err := os.Open(filepath.Join(path, match.Name))
			if err != nil {
				return nil, "", err
			}
			defer file.Close()

			zipFile, err := zipWriter.Create(match.Name)
			if err != nil {
				return nil, "", err
			}

			_, err = file.WriteTo(zipFile)
			if err != nil {
				return nil, "", err
			}
		}

		zipWriter.Close()

		// Read the zip archive.
		content, err := os.ReadFile(zipFile.Name())
		if err != nil {
			return nil, "", err
		}

		return content, zipFile.Name(), nil
	} else if len(matches) == 1 {
		return GetPoolFileContent(path, matches[0].Name), matches[0].Name, nil
	} else {
		return nil, "", fmt.Errorf("no files found")
	}
}

func RemovePoolFile(path string, file string) {
	os.Remove(filepath.Join(path, file))
}

func SavePoolFile(path string, filename string, content []byte) error {
	dst, err := os.Create(filepath.Join(path, filename))
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = dst.Write(content)
	if err != nil {
		return err
	}

	return nil
}
