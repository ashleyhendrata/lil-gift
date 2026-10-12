const Anthropic = require('@anthropic-ai/sdk');
const { sanitize, SHAPES } = require('./sceneSpec');

const SYSTEM = `You design small, cute 3D objects for a desktop widget by composing primitives.
Reply with ONLY a JSON object, no prose, no code fences:
{"objects":[{"shape":one of ${SHAPES.join('|')},"color":"#rrggbb","position":[x,y,z],"rotation":[x,y,z],"scale":[x,y,z],"emissive":0-1,"metalness":0-1,"roughness":0-1}],"animation":{"spin":-3..3,"float":0..1}}
Rules: the whole object fits in a 2x2x2 box centered at the origin (y is up). Use 3-25 primitives, scale values 0.05-2. Use a pleasing, cohesive palette. Primitives are unit-sized (box 1x1x1, sphere diameter 1, etc). Make it recognizable and charming.`;

async function generate(prompt, apiKey) {
  const client = new Anthropic({ apiKey });
  const res = await client.messages.create({
    model: 'claude-sonnet-5-5',
    max_tokens: 4000,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  return sanitize(JSON.parse(json));
}

module.exports = { generate };
