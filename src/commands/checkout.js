import i18n from '../services/i18n.js';

export async function gitCheckout(repo, provider, options) {
  const { name = null, context = null, shouldGenerateName = false } = options;
  const branchsContext = await repo.getBranches({ count: 10 });

  console.log(options);

  try {
    const branchName = shouldGenerateName
       ? "ai_generated"
       : name
      // : await provider.generateBranchName(context) 
    
    if (shouldGenerateName) {
      // repo.createBranch(branchName, true);
      console.log("creating and checking out to branch ", branchName)
    } else {
      // repo.checkout(branchName)
      console.log("checking out to branch ", branchName)
    }
  } catch (error) {
    console.error(i18n.t('output.prefixes.error'), error.message);
    throw error;
  }
}

// function chooseGivenContext()
