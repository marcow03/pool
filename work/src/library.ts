import path from 'path'
import { copyFileSync, createWriteStream, mkdirSync, readdirSync, rmSync, WriteStream } from 'fs';
import { v4 as uuidv4 } from 'uuid'
import archiver from 'archiver'

export const pool = `${path.resolve(__dirname, '..')}/pool`
const tmp = `${path.resolve(__dirname, '..')}/tmp`

export const filterPool = (filter: string) => {
    let files: string[] = []
    if(isEmpty(filter)){
        files = readdirSync(pool)
    } else {
        readdirSync(pool).forEach(file => {
            if(file.match(filter)){
                files.push(file)
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

export const cleanPool = async (filter: string) => {
    const files: string[] = []
    readdirSync(pool).forEach(file => {
        if(isEmpty(filter)){
            rmSync(`${pool}/${file}`)
            files.push(file)
        } else if(file.match(filter)){
            rmSync(`${pool}/${file}`)
            files.push(file)
        }
    })
    return files
}

export const isEmpty = (value: string | any[]) => {
    if(typeof(value) === 'string'){
        return (!value || value.length === 0)
    } else if(Array.isArray(value)){
        return (value.length === 0 ? true : false)
    } else {
        return false
    }
}