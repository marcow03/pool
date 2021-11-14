import express from 'express';
import multer from 'multer'
import morgan from 'morgan'
import {filterPool, makeZip, cleanTmp, cleanPool, getContent, isEmpty, pool, web} from './library'

const app = express()
const port: number = 8080

app.use(morgan('short'))
app.use(express.static(web))

app.get('/api/list/:filter?/:method?', (req, res) => {
    const files: string[] = filterPool(req.params.filter, req.params.method)
    res.send(files)
})

app.get('/api/pull/:filter?/:method?', async (req, res) => {
    const files: string[] = filterPool(req.params.filter, req.params.method)
    if(files.length === 1){
        res.sendFile(`${pool}/${files[0]}`)
    } else if(!isEmpty(files)){
        const zipFile: string = await makeZip(files)
        res.on('finish', () => cleanTmp(zipFile)).sendFile(zipFile)
    } else {
        res.send('no file found')
    }
})

app.get('/api/rm/:filter?/:method?', async (req, res) => {
    const files: string[] = filterPool(req.params.filter, req.params.method !== undefined ? req.params.method : 'exact')
    await cleanPool(files)
    res.sendStatus(200)
})

app.get('/api/get/:file', async (req, res) => {
    const files: string[] = filterPool(req.params.file, 'exact')
    if(files.length === 1){
        const file: string = await getContent(files[0])
        res.send(file)
    } else {
        res.send('none or multiple file found')
    }
})

const upload = multer({storage: multer.diskStorage({
    destination(req, file, callback) {callback(null, pool)},
    filename(req, file, callback) {callback(null, file.originalname)}
})}).array('files')

app.post('/api/push', upload, (req, res) => {
    res.redirect('/')
})

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server startet at http://0.0.0.0:${port}`)
})