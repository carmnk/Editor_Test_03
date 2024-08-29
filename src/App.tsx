import React from 'react'
import { useMemo } from 'react'
import { HtmlRenderer } from './_renderer/renderer/HtmlRenderer'
import { useEditorController } from './_renderer/editorController/editorController'
import appData from './app_data.json'
import { BrowserRouter } from 'react-router-dom'
import { transformEditorStateFromPayload } from './_renderer/apiController/transformEditorDbState'
import { baseComponents } from './_renderer/editorComponents/baseComponents'
import { defaultEditorState } from './_renderer/editorController/editorState'
import packageJson from '../package.json'

// console.log('appData', appData)

function App() {
  const appDataAdj = useMemo(() => {
    const transformedState = transformEditorStateFromPayload(
      appData as any,
      defaultEditorState(),
      baseComponents
    )
    

    // adjust images -> images are currently supposed to be in the json - imageFiles.[n].image
    //CLOUD SOLutioN BACK !!!
    const images = transformedState.assets.images

    // this way is for base64 pictures
    // const adjImages = transformedState.assets.images.map((img) => ({
    //   ...img,
    //   image:
    //     appData?.imageFiles?.find?.((file) => file.asset_id === img._id)
    //       ?.image || null,
    // }))
    return {
      ...transformedState,

      elements: transformedState.elements.map((el) => {
        const image = images.find(
          (img) => img._id === (el as any)?.attributes?.src
        )
        const imageId = image?._id
        const imageFilename = image?.fileName
        const imageFilenameExtension = imageFilename?.split('.').pop()
        const newImageFilename = `${imageId}.${imageFilenameExtension}`
        const path = packageJson.homepage + '/assets/images/' + newImageFilename

        return el._type === 'img' && el.attributes?.src
          ? {
              ...el,
              attributes: {
                ...el.attributes,
                src: path,

                // adjImages.find((adjImg) => adjImg._id === el?.attributes?.src)
                //   ?.image || null,
              },
            }
          : el
      }),
      assets: {
        ...transformedState.assets,
        images,
      },
    }
  }, [])

  console.log('IN', appData)
  const editorController = useEditorController({
    initialEditorState: appDataAdj as any,
    // injections: {
    //   components: [...baseComponents, buttonEditorComponentDef],
    // },
  })
  console.log('OUT', editorController)
  const theme = editorController.editorState.theme

  return (
    <>
      <BrowserRouter basename={packageJson?.homepage}>
        <HtmlRenderer
          editorController={editorController}
          theme={theme}
          isProduction
        ></HtmlRenderer>
      </BrowserRouter>
    </>
  )
}

export default App
