import express from 'express';
import multer from 'multer'
import morgan from 'morgan'
import {filterPool, makeZip, cleanTmp, cleanPool, isEmpty, pool, web} from './library'

const app = express()
const port: number = 8080

app.use(morgan('short'))
app.use(express.static(web))

app.get('/api/list/:filter?', (req, res) => {
    const files: string[] = filterPool(req.params.filter)
    res.send(files)
})

app.get('/api/get/:filter?', async (req, res) => {
    const files: string[] = filterPool(req.params.filter)
    if(files.length === 1){
        res.sendFile(`${pool}/${files[0]}`)
    } else if(!isEmpty(files)){
        const zipFile: string = await makeZip(files)
        res.on('finish', () => cleanTmp(zipFile)).sendFile(zipFile)
    } else {
        res.send('no file found')
    }
})

app.get('/api/rm/:filter?', async (req, res) => {
    const files: string[] = await cleanPool(req.params.filter)
    res.send(files)
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