package assets

import "embed"

//go:embed help.md
var HelpFile string

//go:embed poolctl
var PoolCtlFile string

//go:embed web/*
var StaticContentFS embed.FS
