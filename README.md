What is this?
=============

This is a proof of concept to show an implementation of *autonomous agents* combined with *genetic algorithms*.

####[Live Demo](http://cazala.github.io/shoal/)

###Autonomous Agents

- **Limited ability to perceive the environment:** Every fish can only see things (other fish and food) within a restricted range.

- **Process information from environment and compute an action:** In this case the actions are computed as forces (vectors). If the environment tells the fish that there's a huge scary fish ahead, the action will be a force in the oposite direction, or if the fish sees food, a force will pull it towards it. There are social behaviors like shoaling/schooling that come from basic separation, alignment and cohesion forces. There are also evolutionary strategies, like the affinity for other fishes of a similar color, this promotes the generation of different races. All these forces are added-up at every time-step and result making the fish decide in which direction to swim.

- **No leader:** The fishes are not commanded by a leader to display complex behaviors like shoaling/schooling; these intelligent and structured dynamics emerge from local interactions from the agents themselves.

###Genetic Algorithms
	
- **Population:** The population of fishes is randomly generated with random values for their DNA. The genotype of a fish consists basically of 2 genes (mass and hue), which basically then produce the phenotype of the fish (color, size, max speed, range of view, maturity threshold, bite size, etc).

- **Selection:** Fishes are born with a certain amount of energy that they will spend to move (swim), and when they run out of it they die. They can eat food to gain energy, and also they can eat other fishes that are smaller than them (less than half of their mass). The more energy they can collect, the longer they will live.

- **Reproduction:** Agents can spawn offsprings, they have to reach a certain age (it varies depending on the mass of the fish), once they do, they are able to mate, therefore perpetuating their genes. When they mate, the fertility threshold is increased again, and if the fish collects enough food to live longer it can mate several times, but the older the fish gets the more energy it consumes to swim, so in the end every fish dies.

- **Crossover and Mutation:** The offsprings are a crossover of the genes of their parents (if one parent is big and the other one is small, the child will be medium sized; if one is red and the other one is blue, the child will be purple), but a really small fraction of the offsprings get mutated genes, thus introducing new features to the population.

######Inspired by [The Nature of Code](http://natureofcode.com/)
