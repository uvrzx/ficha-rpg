# Ficha RPG — Nível 1

Ficha interativa de personagem para uma campanha de RPG cyberpunk/investigação.
Página única (HTML + CSS + JS), sem build, sem servidor — **baixe e abra o
`index.html` no navegador**, ou hospede a pasta estática.

## Classes

Cinco classes, cada uma com sua paleta, arte, personagem, atributos, inventário,
história, proficiências e trilha de progressão (nível 1–20):

| Classe        | Personagem        | Arquétipo                  |
|---------------|-------------------|----------------------------|
| Federal       | Mipin Greyrat     | Fighter — versátil         |
| Narcóticos    | Ryan Sheppard     | Rogue — infiltrado         |
| CIA           | Nero Vox          | Ranger / Assassin          |
| Netrunner     | Zane Corvus       | Wizard — tech              |
| Corp Security | David Hasselhoff  | Barbarian / Fighter        |

## Como usar

Abra `index.html`. Troque de classe na barra do topo. A distribuição de pontos
começa **travada** na sugestão da ficha (nível 1); a lógica de point-buy fica
pronta para o level-up. Botão **Imprimir ficha** gera uma folha limpa.

## Estrutura

```
index.html        # a ficha inteira (HTML/CSS/JS inline)
fonts/            # Anton + Chakra Petch (self-hosted, sem CDN)
img/              # artes originais + recortes (*-cut.png)
vendor/           # GSAP + ScrollTrigger + SplitText (offline)
tools/cutout.py   # recorte de fundo das artes (rembg/U2-Net) — rodar só ao trocar arte
test/             # node --test (lógica de atributos + estrutura da página)
```

## Testes

```bash
node --test test/*.test.mjs
```

## Créditos de arte

As artes em `img/` são referências de concept art de terceiros, usadas apenas
neste projeto pessoal de RPG.
