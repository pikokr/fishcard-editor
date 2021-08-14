import React, { useEffect } from 'react'
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import {
    AppBar,
    Container,
    IconButton,
    Toolbar,
    Tooltip,
} from '@material-ui/core'
import {
    MenuOpen as OpenIcon,
    Save as SaveIcon,
    Add as NewIcon,
} from '@material-ui/icons'
import { fabric } from 'fabric'

function download(filename: string, text: string) {
    const element = document.createElement('a')
    element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
    )
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
}

const Editor = () => {
    const { editor, onReady } = useFabricJSEditor()
    const [init, setInit] = React.useState(false)

    useEffect(() => {
        if (init) return
        if (editor) {
            setInit(true)
        }
    }, [editor, init])

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <AppBar position="relative">
                <Toolbar style={{ gap: 10 }}>
                    <Tooltip title="만들기">
                        <label htmlFor="new_input">
                            <input
                                type="file"
                                id="new_input"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(event) => {
                                    if (editor) {
                                        const file = event.target.files![0]
                                        if (file) {
                                            const img = new Image()
                                            const url =
                                                URL.createObjectURL(file)
                                            img.onload = () => {
                                                const canvas =
                                                    document.createElement(
                                                        'canvas',
                                                    )

                                                canvas.width = img.width
                                                canvas.height = img.height

                                                const ctx =
                                                    canvas.getContext('2d')!
                                                ctx.drawImage(img, 0, 0)

                                                const imageURL =
                                                    canvas.toDataURL(
                                                        'image/png',
                                                    )

                                                editor.canvas.width = img.width
                                                editor.canvas.height =
                                                    img.height

                                                const fCanvas =
                                                    editor.canvas as any
                                                fCanvas.setWidth(img.width)
                                                fCanvas.setHeight(img.height)

                                                editor.deleteAll()

                                                fabric.Image.fromURL(
                                                    imageURL,
                                                    (i) => {
                                                        i.set({
                                                            left: 0,
                                                            top: 0,
                                                            width: img.width,
                                                            height: img.height,
                                                            lockMovementX: true,
                                                            lockMovementY: true,
                                                            lockRotation: true,
                                                            lockScalingFlip:
                                                                true,
                                                            lockScalingX: true,
                                                            lockScalingY: true,
                                                            lockSkewingX: true,
                                                            lockSkewingY: true,
                                                            lockUniScaling:
                                                                true,
                                                            hasControls: false,
                                                        })
                                                        fCanvas.add(i)
                                                    },
                                                )

                                                URL.revokeObjectURL(url)
                                            }
                                            img.src = url
                                        }
                                    }
                                }}
                            />
                            <IconButton color="inherit" component="span">
                                <NewIcon />
                            </IconButton>
                        </label>
                    </Tooltip>
                    <Tooltip title="열기">
                        <IconButton color="inherit">
                            <OpenIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="저장">
                        <IconButton
                            color="inherit"
                            onClick={() => {
                                const canvas = editor!.canvas as any
                                download(
                                    'card.json',
                                    JSON.stringify({
                                        canvasData: canvas.toJSON(),
                                        width: canvas.width,
                                        height: canvas.height,
                                    }),
                                )
                            }}
                        >
                            <SaveIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <Container style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div
                        style={{
                            border: '1px solid #000',
                            display: 'inline-block',
                        }}
                    >
                        <FabricJSCanvas onReady={onReady} />
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default Editor
