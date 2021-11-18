import path from 'path'
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, WriteStream } from 'fs';
import { v4 as uuidv4 } from 'uuid'
import archiver from 'archiver'

export const pool = `${path.resolve(__dirname, '..')}/pool`
export const web = `${path.resolve(__dirname, '..')}/static`
const tmp = `${path.resolve(__dirname, '..')}/tmp`

export const initWorkspace = () => {
    if(!existsSync(pool)){mkdirSync(pool)}
    if(!existsSync(tmp)){mkdirSync(tmp)}
}

export const filterPool = (filter: string, method: string = 'exact') => {
    if(filter === '*'){filter = ''}
    let files: string[] = []
    if(isEmpty(filter)){
        files = readdirSync(pool)
    } else {
        readdirSync(pool).forEach(file => {
            if(method === 'match'){
                if(file.match(filter)){
                    files.push(file)
                }
            } else if (method === 'exact'){
                if(filter === file.substring(file.lastIndexOf('/'))){
                    files.push(file)
                }
            }
        })
    }
    return files
}

export const makeZip = async (files: string[]) => {
    const zipDir: string = mkdirSync(`${tmp}/${uuidv4().split('-')[0]}`, {recursive: true})
    files.forEach(file => {
        copyFileSync(`${pool}/${file}`, `${zipDir}/${file}`)
    })
    const zipFile: WriteStream = createWriteStream(`${zipDir}.zip`)
    const zipArchive: archiver.Archiver = archiver('zip')
    zipArchive.pipe(zipFile)
    zipArchive.directory(zipDir, false)
    await zipArchive.finalize()
    await new Promise(ctx => zipFile.on('finish', ctx))
    return zipFile.path.toString()
}

export const cleanTmp = async (pattern: string) => {
    rmSync(pattern)
    rmSync(pattern.split('.')[0], {recursive: true})
}

export const cleanPool = async (files: string[]) => {
    files.forEach(file => {
        rmSync(`${pool}/${file}`)
    })
}

export const getContent = async (file: string) => {
    return readFileSync(`${pool}/${file}`, 'utf8')
}

export const isEmpty = (value: string | any[]) => {
    if(typeof(value) === 'string'){
        return (!value || value.length === 0)
    } else if(Array.isArray(value)){
        return (value.length === 0 ? true : false)
    } else if(value === undefined){
        return true
    } else {
        return false
    }
}