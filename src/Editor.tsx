import React, { useEffect } from 'react'
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import {
    AppBar,
    Container,
    IconButton,
    Paper,
    TextField,
    Toolbar,
    Tooltip,
} from '@material-ui/core'
import {
    MenuOpen as OpenIcon,
    Save as SaveIcon,
    Add as NewIcon,
    TextFields as AddTextIcon,
    Delete,
} from '@material-ui/icons'
import { fabric } from 'fabric'
import { CompactPicker } from 'react-color'

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

function useForceUpdate() {
    const [value, setValue] = React.useState(0) // integer state
    return () => setValue(value + 1) // update the state to force render
}

const Editor = () => {
    const { editor, onReady } = useFabricJSEditor()
    const [init, setInit] = React.useState(false)
    const update = useForceUpdate()

    useEffect(() => {
        if (init) return
        if (editor) {
            setInit(true)
        }
    }, [editor, init])

    const obj = editor?.canvas?.getActiveObject() as any

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

                                                fCanvas.setBackgroundImage(
                                                    imageURL,
                                                    () => {
                                                        fCanvas.renderAll()
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
                        <label htmlFor="open_input">
                            <input
                                type="file"
                                id="open_input"
                                accept=".json"
                                style={{ display: 'none' }}
                                onChange={async (event) => {
                                    if (editor) {
                                        const file = event.target.files![0]
                                        if (file) {
                                            const canvas = editor.canvas as any
                                            const json = JSON.parse(
                                                await file.text(),
                                            )
                                            canvas.setWidth(json.width)
                                            canvas.setHeight(json.height)
                                            canvas.loadFromJSON(
                                                json.canvasData,
                                                () => {
                                                    canvas.renderAll()
                                                },
                                            )
                                        }
                                    }
                                }}
                            />
                            <IconButton color="inherit" component="span">
                                <OpenIcon />
                            </IconButton>
                        </label>
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
                    <Tooltip title="텍스트 추가">
                        <IconButton
                            color="inherit"
                            onClick={() => {
                                const text = new fabric.Text('Text', {
                                    fontFamily: 'Noto Sans KR',
                                    fill: '#000',
                                    fontWeight: 500,
                                })
                                editor!.canvas.add(text)
                            }}
                        >
                            <AddTextIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <Container style={{ marginTop: 20 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            border: '1px solid #000',
                            display: 'inline-block',
                        }}
                    >
                        <FabricJSCanvas onReady={onReady} />
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: 10,
                    }}
                >
                    <Paper style={{ padding: 10, display: 'inline-block' }}>
                        {obj ? (
                            <div>
                                <div style={{ marginBottom: 10 }}>
                                    <IconButton
                                        onClick={() =>
                                            editor!.canvas.remove(obj)
                                        }
                                    >
                                        <Delete />
                                    </IconButton>
                                </div>
                                {(() => {
                                    switch (obj.type) {
                                        case 'text':
                                            return (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 10,
                                                    }}
                                                >
                                                    <TextField
                                                        label="텍스트"
                                                        value={obj.text}
                                                        onChange={(e) => {
                                                            obj.text =
                                                                e.target.value
                                                            editor?.canvas?.renderAll()
                                                            update()
                                                        }}
                                                    />
                                                    <TextField
                                                        label="굵기"
                                                        value={obj.fontWeight}
                                                        type="number"
                                                        onChange={(e) => {
                                                            obj.fontWeight =
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            editor?.canvas?.renderAll()
                                                            update()
                                                        }}
                                                    />
                                                    <CompactPicker
                                                        color={obj.fill}
                                                        onChangeComplete={(
                                                            c,
                                                        ) => {
                                                            obj.set({
                                                                fill: c.hex,
                                                            })
                                                            editor!.canvas.renderAll()
                                                            update()
                                                        }}
                                                    />
                                                </div>
                                            )
                                        default:
                                            return (
                                                <div>
                                                    지원되지 않는 오브젝트
                                                    타입입니다
                                                </div>
                                            )
                                    }
                                })()}
                            </div>
                        ) : (
                            '오브젝트를 선택해주세요'
                        )}
                    </Paper>
                </div>
            </Container>
        </div>
    )
}

export default Editor
