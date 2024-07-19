import { Button, Frog } from 'frog'
import { createSystem } from 'frog/ui'
import { serveStatic } from '@hono/node-server/serve-static';
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config();

const { Box, Columns, Column, Rows, Row, Image, Text, vars } = createSystem();

// Uncomment to use Edge Runtime.
export const config = {
   runtime: 'edge',
}

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'BRND Frame',
  ui: { vars },
  imageOptions: {
    height: 600,
    width: 600,
  }
  // TODO. Cambiar fuente a INTER
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.use('/*', serveStatic({ root: './public' }))

app.frame('/:id', async (c) => {
  let id = c.req.param('id');

  if (id === undefined) id = '599e9c74-1f10-4339-8bd4-593bec6f3c20';
  console.log('Entering frame with id: ', id);

  const votes = await axios.get(`${process.env.BRND_API as string}/${id}`);
  const data = votes.data;
    
  return c.res({
    image: `/img/${id}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button.Link href={data.brand1.url}>{data.brand1.name}</Button.Link>,
      <Button.Link href={data.brand2.url}>{data.brand2.name}</Button.Link>,
      <Button.Link href={data.brand3.url}>{data.brand3.name}</Button.Link>,
      <Button.Link href='https://brnd.land'>BRND</Button.Link>,
    ],
  })
})

app.image('/img/:id', async (c) => {
  const id = c.req.param('id');
  console.log('Entering image with id: ', id);

  const votes = await axios.get(`${process.env.BRND_API as string}/${id}`)
  const data = votes.data;

  const logo = `${process.env.INTERNAL_ADDRESS as string}/LOGO.png`;
  const line = `${process.env.INTERNAL_ADDRESS as string}/LINE.png`;

  console.log(data.brand1.imageUrl);
  console.log(data.brand2.imageUrl);
  console.log(data.brand3.imageUrl);

  return c.res({
    image: (
      <Box backgroundColor="background" paddingTop="16">
        <Rows>
          <Row height='1/3' paddingBottom={'16'}>
            <Box alignHorizontal='center' paddingBottom={'16'}>
              <Image src={logo} width={'256'}></Image>
            </Box>
            <Image src={line}></Image>
          </Row>
          <Row>
            <Columns padding="4">
              <Column alignHorizontal='center' alignVertical='bottom'>
                <Box marginBottom={'8'} gap={'8'} alignHorizontal='center'>
                  <Image src={data.brand2.imageUrl} borderRadius={'32'} width={'128'} height={'128'}></Image>
                  <Text align='center'>{data.brand2.name}</Text>
                </Box>
                <Image src={`${process.env.INTERNAL_ADDRESS as string}/Brand2.png`}></Image>
              </Column>
              <Column alignHorizontal='center' alignVertical='bottom'>
                <Box marginBottom={'8'} gap={'8'} alignHorizontal='center'>
                  <Image src={data.brand1.imageUrl} borderRadius={'32'} width={'128'} height={'128'}></Image>
                  <Text>{data.brand1.name}</Text>
                </Box>
                <Image src={`${process.env.INTERNAL_ADDRESS as string}/Brand1.png`}></Image>
              </Column>
              <Column alignHorizontal='center' alignVertical='bottom'>
                <Box marginBottom={'8'} gap={'8'} alignHorizontal='center'>
                  <Image src={data.brand3.imageUrl} borderRadius={'32'} width={'128'} height={'128'}></Image>
                  <Text>{data.brand3.name}</Text>
                </Box>
                <Image src={`${process.env.INTERNAL_ADDRESS as string}/Brand3.png`}></Image>
              </Column>
            </Columns>
          </Row>
        </Rows>
      </Box>
    ),
    headers: {
      'Cache-Control': 'max-age=0'
    }
  })
})

export const GET = handle(app)
export const POST = handle(app)
