const { execFileSync } = require('child_process');
const path = require('path');

// Golden master : on capture la sortie complète de la simulation sur 30 jours.
// Le premier lancement crée l'instantané (__snapshots__), les suivants le comparent.
// Si ce test casse pendant un refactoring, le comportement a changé.
describe('Golden master de la simulation', () => {
  it('devrait produire la même sortie sur 30 jours', () => {
    const script = path.join(__dirname, '..', 'scripts', 'simulate.js');

    const output = execFileSync('node', [script, '30'], { encoding: 'utf-8' });

    expect(output).toMatchSnapshot();
  });
});
