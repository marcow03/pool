#!/bin/bash

# Function to list files
list_files() {
    if [ -z "$1" ]; then
        curl https://pool.ruro.net/api/list
    else
        curl https://pool.ruro.net/api/list/"$1"
    fi
}

# Function to get file contents (raw)
get_file() {
    if [ -z "$1" ]; then
        echo "Usage: $0 get <filename>"
    else
        curl https://pool.ruro.net/api/get/"$1"
    fi
}

# Function to push a file
push_file() {
    if [ -z "$1" ]; then
        echo "Usage: $0 push <path-to-file>"
    else
        curl https://pool.ruro.net/api/push -k -F files=@"$1"
    fi
}

# Function to pull a file or files
pull_file() {
    if [ -z "$1" ]; then
        echo "Usage: $0 pull <filename or pattern>"
    else
        curl https://pool.ruro.net/api/pull/"$1" -O
    fi
}

# Function to delete a file or files
delete_file() {
    if [ -z "$1" ]; then
        echo "Usage: $0 delete <filename or pattern>"
    else
        curl https://pool.ruro.net/api/rm/"$1"
    fi
}

# Function to install the script
install_script() {
    script_name="poolctl"
    install_path="/usr/local/bin/$script_name"

    # Copy script to /usr/local/bin and make it executable
    sudo cp "$0" "$install_path"
    sudo chmod +x "$install_path"

    echo "Script installed to $install_path"
    echo "Add the following line to your .bashrc or .zshrc to use it from any location:"
    echo "export PATH=\"/usr/local/bin:\$PATH\""
}

# Function to display usage
display_usage() {
    echo "Usage: $0 <command> [options]"
    echo
    echo "Commands:"
    echo "  list [filename|pattern]      List file(s)"
    echo "  get <filename>               Get file contents (raw)"
    echo "  push <path-to-file>          Push file"
    echo "  pull <filename|pattern>      Pull file(s)"
    echo "  delete <filename|pattern>    Delete file(s)"
    echo "  install                      Install this script"
    echo
}

# Main command handling
case "$1" in
    list)
        list_files "$2"
        ;;
    get)
        get_file "$2"
        ;;
    push)
        push_file "$2"
        ;;
    pull)
        pull_file "$2"
        ;;
    delete)
        delete_file "$2"
        ;;
    install)
        install_script
        ;;
    *)
        display_usage
        ;;
esac
